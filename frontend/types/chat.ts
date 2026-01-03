import { DecodedMessage } from '@xmtp/react-sdk'

export interface ChatMessage extends DecodedMessage {
  id: string
  senderAddress: string
  content: string
  timestamp: Date
  contentType: string
  isPinned?: boolean
  reactions?: MessageReaction[]
  replyTo?: string
}

export interface MessageReaction {
  emoji: string
  senders: string[]
  count: number
}

export interface PinnedMessage {
  id: string
  message_id: string
  pool_id: string
  pinned_by: string
  pinned_at: string
  message_content: string
  message_sender: string
}

export interface Poll {
  id: string
  pool_id: string
  creator_address: string
  question: string
  options: PollOption[]
  closes_at: string | null
  created_at: string
  is_active: boolean
}

export interface PollOption {
  id: string
  poll_id: string
  option_text: string
  vote_count: number
}

export interface PollVote {
  id: string
  poll_id: string
  option_id: string
  voter_address: string
  voted_at: string
}

export interface MemberProfile {
  wallet_address: string
  display_name: string | null
  avatar_url: string | null
  reputation_score: number
  total_groups_joined: number
  on_time_payments: number
}

export interface TypingIndicator {
  address: string
  timestamp: number
}

export interface ChatMention {
  address: string
  displayName: string
  position: number
}