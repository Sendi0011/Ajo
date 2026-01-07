import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transactionIds, payload } = body;
    
    if (!action || !transactionIds || transactionIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and transaction IDs required' },
        { status: 400 }
      );
    }
    
    let successCount = 0;
    let failureCount = 0;
    const errors: any[] = [];
    
    switch (action) {
      case 'TAG':
        if (!payload?.tags || payload.tags.length === 0) {
          return NextResponse.json({ error: 'Tags required' }, { status: 400 });
        }
        
        for (const id of transactionIds) {
          try {
            // Fetch current tags
            const { data: tx } = await supabase
              .from('transactions')
              .select('tags')
              .eq('id', id)
              .single();
            
            const currentTags = tx?.tags || [];
            const newTags = [...new Set([...currentTags, ...payload.tags])];
            
            const { error } = await supabase
              .from('transactions')
              .update({ tags: newTags })
              .eq('id', id);
            
            if (error) throw error;
            successCount++;
          } catch (err) {
            failureCount++;
            errors.push({ transactionId: id, error: (err as Error).message });
          }
        }
        break;
      
      case 'UNTAG':
        if (!payload?.tags || payload.tags.length === 0) {
          return NextResponse.json({ error: 'Tags required' }, { status: 400 });
        }
        
        for (const id of transactionIds) {
          try {
            const { data: tx } = await supabase
              .from('transactions')
              .select('tags')
              .eq('id', id)
              .single();
            
            const currentTags = tx?.tags || [];
            const newTags = currentTags.filter((tag: string) => 
              !payload.tags.includes(tag)
            );
            
            const { error } = await supabase
              .from('transactions')
              .update({ tags: newTags })
              .eq('id', id);
            
            if (error) throw error;
            successCount++;
          } catch (err) {
            failureCount++;
            errors.push({ transactionId: id, error: (err as Error).message });
          }
        }
        break;
      
      case 'BOOKMARK':
      case 'UNBOOKMARK':
        const isBookmarked = action === 'BOOKMARK';
        
        const { error: bookmarkError } = await supabase
          .from('transactions')
          .update({ is_bookmarked: isBookmarked })
          .in('id', transactionIds);
        
        if (bookmarkError) {
          throw bookmarkError;
        }
        
        successCount = transactionIds.length;
        break;
      
      case 'CATEGORIZE':
        if (!payload?.category) {
          return NextResponse.json({ error: 'Category required' }, { status: 400 });
        }
        
        const { error: categoryError } = await supabase
          .from('transactions')
          .update({ transaction_category: payload.category })
          .in('id', transactionIds);
        
        if (categoryError) {
          throw categoryError;
        }
        
        successCount = transactionIds.length;
        break;
      
      case 'ADD_NOTE':
        if (!payload?.note) {
          return NextResponse.json({ error: 'Note required' }, { status: 400 });
        }
        
        for (const id of transactionIds) {
          try {
            const { error } = await supabase
              .from('transactions')
              .update({ notes: payload.note })
              .eq('id', id);
            
            if (error) throw error;
            successCount++;
          } catch (err) {
            failureCount++;
            errors.push({ transactionId: id, error: (err as Error).message });
          }
        }
        break;
      
      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .in('id', transactionIds);
        
        if (deleteError) {
          throw deleteError;
        }
        
        successCount = transactionIds.length;
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      successCount,
      failureCount,
      errors,
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}