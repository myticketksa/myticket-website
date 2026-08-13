import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export type ToastTone = 'success' | 'error' | 'neutral'

export interface Toast {
  id: string
  tone: ToastTone
  message: string
}

interface UiState {
  toasts: Toast[]
  mobileNavOpen: boolean
}

const initialState: UiState = {
  toasts: [],
  mobileNavOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toastPushed: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload)
      },
      prepare(tone: ToastTone, message: string) {
        return { payload: { id: nanoid(), tone, message } }
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    mobileNavToggled(state, action: PayloadAction<boolean | undefined>) {
      state.mobileNavOpen = action.payload ?? !state.mobileNavOpen
    },
  },
})

export const { toastPushed, toastDismissed, mobileNavToggled } = uiSlice.actions
export default uiSlice.reducer
