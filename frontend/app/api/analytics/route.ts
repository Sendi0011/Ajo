import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userAddress = searchParams.get('userAddress')
    const format = searchParams.get('format') || 'csv'

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      )
    }

    // Fetch user's data
    const { data: activities } = await supabase
      .from('pool_activity')
      .select(`
        *,
        pools (
          name,
          type
        )
      `)
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false })

    const { data: pools } = await supabase
      .from('pool_members')
      .select(`
        *,
        pools (
          name,
          type,
          status,
          total_saved,
          target_amount
        )
      `)
      .eq('member_address', userAddress.toLowerCase())

    if (format === 'csv') {
      const csv = generateCSV(activities, pools, userAddress)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ajo-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else if (format === 'pdf') {
      // For PDF, we'll return HTML that can be printed/converted to PDF
      const html = generatePDFHTML(activities, pools, userAddress)
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


}