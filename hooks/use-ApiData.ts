"use client"

import { useEffect, useRef, useState } from "react"

export type ApiDataState<T> = {
  data?: T
  error?: Error
  isLoading: boolean
}

/**
 * Runs `load` on mount (and again whenever `deps` change), tracking
 * loading / error / data
 *
 * The loader is kept in a ref so passing an inline function does not re-run
 * the effect on every render, only `deps` control when the request fires as usual
 */
export function useApiData<T>(load: () => Promise<T>, deps: unknown[] = []): ApiDataState<T> {
  const [state, setState] = useState<ApiDataState<T>>({ isLoading: true })

  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    let cancelled = false

    loadRef.current().then(
      (data) => {
        if (!cancelled) setState({ data, isLoading: false })
      },
      (error: unknown) => {
        if (!cancelled) {
          setState({
            error: error instanceof Error ? error : new Error(String(error)),
            isLoading: false,
          })
        }
      },
    )

    // Guards against a stale/unmounted response writing state
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
