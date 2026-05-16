'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CartItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().optional().nullable(),
  quantity: z.number().int().min(1).max(99).default(1),
})

async function getOrSetGuestId() {
  const cookieStore = await cookies()
  let guestId = cookieStore.get('eclat_guest_id')?.value

  if (!guestId) {
    guestId = uuidv4()
    // Secure cookie setup
    cookieStore.set('eclat_guest_id', guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return guestId
}

export async function addToCart(rawProductId: string, rawSize?: string | null, rawQuantity: number = 1) {
  const parsed = CartItemSchema.safeParse({ productId: rawProductId, size: rawSize, quantity: rawQuantity })
  if (!parsed.success) {
    return { error: 'Invalid product data' }
  }

  const { productId, size, quantity } = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userId = null
  let guestId = null

  if (user) {
    userId = user.id
  } else {
    guestId = await getOrSetGuestId()
  }

  // Insert or Update (upsert) the cart item
  // To handle the unique constraint, we use an RPC or do a select then update/insert
  const { data: existingItem } = await supabase
    .from('cart')
    .select('id, quantity')
    .eq('product_id', productId)
    .eq(userId ? 'user_id' : 'guest_id', userId || guestId)
    .eq('size', size || '')
    .single()

  if (existingItem) {
    const { error } = await supabase
      .from('cart')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)

    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('cart')
      .insert({
        user_id: userId,
        guest_id: guestId,
        product_id: productId,
        size: size || '',
        quantity,
      })

    if (error) return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function mergeGuestCart() {
  const cookieStore = await cookies()
  const guestId = cookieStore.get('eclat_guest_id')?.value

  if (!guestId) return { success: true }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: true }

  // Admin client needed if RLS blocks users from selecting guest carts
  const adminClient = await createAdminClient()

  // Find all guest items
  const { data: guestItems } = await adminClient
    .from('cart')
    .select('*')
    .eq('guest_id', guestId)

  if (!guestItems || guestItems.length === 0) {
    // Clear cookie
    cookieStore.delete('eclat_guest_id')
    return { success: true }
  }

  // Find user items
  const { data: userItems } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', user.id)

  for (const guestItem of guestItems) {
    const existingUserItem = userItems?.find(
      u => u.product_id === guestItem.product_id && u.size === guestItem.size
    )

    if (existingUserItem) {
      // Update quantity
      await supabase
        .from('cart')
        .update({ quantity: existingUserItem.quantity + guestItem.quantity })
        .eq('id', existingUserItem.id)

      // Delete guest item
      await adminClient.from('cart').delete().eq('id', guestItem.id)
    } else {
      // Transfer ownership
      await adminClient
        .from('cart')
        .update({ user_id: user.id, guest_id: null })
        .eq('id', guestItem.id)
    }
  }

  cookieStore.delete('eclat_guest_id')
  revalidatePath('/')
  return { success: true }
}
