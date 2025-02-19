import { useEffect, useMemo } from 'react';
import { AsyncData, RemoteData, useRemoteData } from '../../../components/RemoteCharts/hook';


export type CollectionHistoryData = {
  repo_name: string
  event_month: string
  total: number
}

export type CollectionHistoryRankData = {
  repo_name: string
  event_year: number
  total: number
  rank: number
}

export type CollectionMonthRankData = {
  current_month: string
  last_month: string
  repo_name: string
  current_month_total: number
  last_month_total: number
  total_mom: number
  current_month_rank: number
  last_month_rank: number
  rank_mom: number
  total: number
}

const SYMBOL_TRANSFORMED = Symbol('transformed-data')

export function useCollectionHistory(collectionId: number | undefined, dimension: string): AsyncData<RemoteData<any, CollectionHistoryData>> {
  const { data, loading, error } = useRemoteData<any, CollectionHistoryData>(`collection-${dimension}-history`, { collectionId }, false, collectionId !== undefined);

  return useMemo(() => {
    // fill previous value if some data missed
    function fix(data: CollectionHistoryData[]): CollectionHistoryData[] {
      // SWR may reuse the original data
      if (data[SYMBOL_TRANSFORMED]) {
        return data[SYMBOL_TRANSFORMED]
      }
      if (data.length === 0) {
        return []
      }
      const result: CollectionHistoryData[] = []
      const min = data[0].event_month
      // MARK: should we use current instead of data max?
      const max = data[data.length - 1].event_month
      let [year, month] = min.split('-').map(Number)
      const [maxYear, maxMonth] = max.split('-').map(Number)
      let i = 0

      const latestValues: Record<string, number> = {}

      while (year < maxYear || (year === maxYear && month <= maxMonth)) {
        // mock server returned time format
        const ts = new Date(`${year}-${String(month).padStart(2, '0')}-01`)
        const current = new Date(ts.getTime() - 8 * 60 * 60 * 1000).toISOString()

        // stores name was not provided in current month
        const nameSet = new Set<string>(Object.keys(latestValues))

        // fill current data
        while (i < data.length) {
          const { repo_name, total, event_month } = data[i];
          if (event_month === current) {
            latestValues[repo_name] = total
            nameSet.delete(repo_name)
            result.push(data[i])
            i++
          } else {
            break
          }
        }

        // fill missing data
        if (nameSet.size > 0) {
          nameSet.forEach(name => {
            result.push({
              event_month: current,
              repo_name: name,
              total: latestValues[name]
            })
          })
        }

        // move current
        if (month === 12) {
          year += 1
          month = 1
        } else {
          month += 1
        }
      }
      Object.defineProperty(data, SYMBOL_TRANSFORMED, {
        value: result,
        writable: false,
        configurable: false,
        enumerable: false,
      })
      return result
    }

    if (data) {
      data.data = fix(data.data)
    }

    return { data, loading, error }
  }, [data])
}

export function useCollectionHistoryRank(collectionId: number | undefined, dimension: string) {
  return useRemoteData<any, CollectionHistoryRankData>(`collection-${dimension}-history-rank`, { collectionId }, false, collectionId !== undefined);
}

export function useCollectionMonthRank(collectionId: number | undefined, dimension: string) {
  return useRemoteData<any, CollectionMonthRankData>(`collection-${dimension}-month-rank`, { collectionId }, false, collectionId !== undefined);
}
