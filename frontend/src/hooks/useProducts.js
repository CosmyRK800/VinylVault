import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook principal pentru produse.
 * Înlocuiește importul static din data/products.js
 *
 * Returnează:
 *   products      — array complet de produse (snake_case → camelCase)
 *   flashSales    — array flash sales active
 *   loading       — true cât timp se încarcă
 *   error         — string cu eroarea sau null
 *   refetch       — funcție pentru reîncărcare manuală
 */
export function useProducts() {
  const [products, setProducts]     = useState([])
  const [flashSales, setFlashSales] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    const [{ data: prods, error: prodErr }, { data: sales, error: salesErr }] =
      await Promise.all([
        supabase.from('products').select('*').order('id'),
        supabase.from('flash_sales').select('*').gte('ends_at', new Date().toISOString()),
      ])

    if (prodErr || salesErr) {
      setError((prodErr || salesErr).message)
      setLoading(false)
      return
    }

    // Supabase returnează snake_case; normalizăm la camelCase
    // ca să nu schimbăm nimic în restul aplicației
    setProducts((prods || []).map(normalizeProduct))
    setFlashSales((sales || []).map(s => ({
      id:        s.id,
      productId: s.product_id,
      endsAt:    new Date(s.ends_at),
    })))
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  return { products, flashSales, loading, error, refetch: fetchData }
}

/**
 * Hook pentru un singur produs după id.
 * Folosit în ProductPage.
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return }
        setProduct(normalizeProduct(data))
        setLoading(false)
      })
  }, [id])

  return { product, loading, error }
}

// ── Helper: snake_case → camelCase ────────────────────────────────────────────
function normalizeProduct(p) {
  return {
    id:            p.id,
    name:          p.name,
    artist:        p.artist,
    category:      p.category,
    format:        p.format,
    genre:         p.genre,
    year:          p.year,
    label:         p.label,
    price:         Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : null,
    discount:      p.discount ?? 0,
    stock:         p.stock ?? 0,
    isNew:         p.is_new ?? false,
    isFeatured:    p.is_featured ?? false,
    images:        p.images ?? [],
    description:   p.description ?? '',
    tags:          p.tags ?? [],
  }
}