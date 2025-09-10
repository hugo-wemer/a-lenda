import type { BlockReadingResponse } from 'shared/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'

type BlockReadingState = {
  blocks: Map<string, BlockReadingResponse>
  addBlocks: (block: BlockReadingResponse) => void
}

enableMapSet()

export const useReadings = create<
  BlockReadingState,
  [['zustand/immer', never]]
>(
  immer((set, get) => {
    function addBlocks(block: BlockReadingResponse) {
      const blockId = block.block //crypto.randomUUID()
      set(state => {
        state.blocks.set(blockId, block)
      })
    }

    return {
      blocks: new Map(),
      addBlocks,
    }
  })
)
