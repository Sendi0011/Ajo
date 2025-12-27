import { NextRequest, NextResponse } from "next/server"

// PATCH - Mark notification as read
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const body = await req.json()
      const { read } = body
  
      const { data, error } = await supabase
        .from('notifications')
        .update({ read })
        .eq('id', params.id)
        .select()
        .single()
  
      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
  
      return NextResponse.json(data)
    } catch (error) {
      console.error('Notification update error:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }
  
  // DELETE - Delete notification
  export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', params.id)
  
      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
  
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Notification delete error:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }
  
  
  