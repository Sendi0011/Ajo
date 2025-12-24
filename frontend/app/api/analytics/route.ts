
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

// Generate CSV
function generateCSV(activities: any[], pools: any[], userAddress: string): string {
  const lines: string[] = []

  // Header
  lines.push(`Ajo Analytics Report`)
  lines.push(`Generated: ${new Date().toLocaleDateString()}`)
  lines.push(`User: ${userAddress}`)
  lines.push(``)

  // Pools Summary
  lines.push(`Pool Summary`)
  lines.push(`Pool Name,Type,Status,Total Saved,Target,Progress`)
  pools?.forEach((p) => {
    const pool = p.pools
    lines.push(
      `"${pool.name}",${pool.type},${pool.status},${pool.total_saved || 0},${pool.target_amount || 'N/A'},${pool.progress || 0}%`
    )
  })
  lines.push(``)

  // Activities
  lines.push(`Activity History`)
  lines.push(`Date,Pool,Activity Type,Amount,Description`)
  activities?.forEach((a) => {
    const pool = a.pools?.name || 'Unknown'
    const date = new Date(a.created_at).toLocaleDateString()
    const amount = a.amount ? `${a.amount} ETH` : 'N/A'
    const description = a.description || ''
    lines.push(
      `${date},"${pool}",${a.activity_type},${amount},"${description}"`
    )
  })

  return lines.join('\n')
}

// Generate PDF-ready HTML
function generatePDFHTML(activities: any[], pools: any[], userAddress: string): string {
  const totalSaved = pools?.reduce((sum, p) => sum + (p.pools?.total_saved || 0), 0) || 0
  const activePoolsCount = pools?.filter((p) => p.pools?.status === 'active').length || 0
  const completedPoolsCount = pools?.filter((p) => p.pools?.status === 'completed').length || 0

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ajo Analytics Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #1f2937;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #3b82f6;
      margin: 0;
    }
    .header p {
      color: #6b7280;
      margin: 10px 0 0 0;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .stat-card h3 {
      margin: 0;
      font-size: 28px;
      color: #3b82f6;
    }
    .stat-card p {
      margin: 5px 0 0 0;
      color: #6b7280;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin: 30px 0 15px 0;
      color: #1f2937;
    }
    .footer {
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Ajo Analytics Report</h1>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
    <p>User: ${userAddress}</p>
  </div>

  <div class="summary">
    <div class="stat-card">
      <h3>${totalSaved.toFixed(2)}</h3>
      <p>Total Saved (ETH)</p>
    </div>
    <div class="stat-card">
      <h3>${activePoolsCount}</h3>
      <p>Active Pools</p>
    </div>
    <div class="stat-card">
      <h3>${completedPoolsCount}</h3>
      <p>Completed Pools</p>
    </div>
  </div>

  <h2 class="section-title">Pool Summary</h2>
  <table>
    <thead>
      <tr>
        <th>Pool Name</th>
        <th>Type</th>
        <th>Status</th>
        <th>Total Saved</th>
        <th>Progress</th>
      </tr>
    </thead>
    <tbody>
      ${pools?.map((p) => `
        <tr>
          <td>${p.pools?.name || 'Unknown'}</td>
          <td>${p.pools?.type || 'N/A'}</td>
          <td>${p.pools?.status || 'N/A'}</td>
          <td>${(p.pools?.total_saved || 0).toFixed(2)} ETH</td>
          <td>${p.pools?.progress || 0}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2 class="section-title">Recent Activity</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Pool</th>
        <th>Activity</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${activities?.slice(0, 20).map((a) => `
        <tr>
          <td>${new Date(a.created_at).toLocaleDateString()}</td>
          <td>${a.pools?.name || 'Unknown'}</td>
          <td>${a.activity_type.replace(/_/g, ' ')}</td>
          <td>${a.amount ? `${a.amount.toFixed(2)} ETH` : 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>This report was generated by Ajo - Community Savings on Base</p>
    <p>For support, visit https://ajo.app</p>
  </div>

  <script>
    // Auto-print when format=pdf is used
    if (window.location.search.includes('format=pdf')) {
      window.print();
    }
  </script>
</body>
</html>
  `
}