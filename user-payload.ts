export interface Root {
  id: number
  created_at: string
  peer_a: PeerA
  peer_b: PeerB
}

export interface PeerA {
  id: string
  email: string
}

export interface PeerB {
  id: string
  email: string
}

