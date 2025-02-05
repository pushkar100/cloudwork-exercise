import { combineEpics, Epic } from 'redux-observable';
import { filter, mergeMap, takeUntil } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { RootAction, RootState } from '../reducer';
import * as workloadsActions from './actions';
import { WorkloadService } from './services';

const workloadService = new WorkloadService
const timer = (time: number) => new Promise(resolve => setTimeout(() => resolve(), time)) 
const createdTimes: { [key: string]: number } = {}

type AppEpic = Epic<RootAction, RootAction, RootState>;

const logWorkloadSubmissions: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.submit)),
    mergeMap(async (action) => {
      const createdTask = await workloadService.create(action.payload)
      createdTimes[`${createdTask.id}`] = Date.now()
      return workloadsActions.created(createdTask)
    })
  )
);

const cancelWorkload: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.cancel)),
    mergeMap(async (action) => {
      const currentWork = await workloadService.checkStatus(action.payload)
      if (['WORKING'].includes(currentWork.status)) {
        const work = await workloadService.cancel(action.payload)
        return workloadsActions.updateStatus(work) 
      }
      return workloadsActions.updateStatus(currentWork) 
    })
  )
);

const workloadTimer: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.created)),
    mergeMap(async (action) => {
      const timeDiff = +action.payload.completeDate - createdTimes[action.payload.id]
      delete createdTimes[action.payload.id]
      await timer(timeDiff)
      const currentWork = await workloadService.checkStatus(action.payload)
      return workloadsActions.updateStatus(currentWork) 
    }),
    takeUntil(action$.pipe(
      filter(isActionOf(workloadsActions.cancel))
    ))
  )
);

export const epics = combineEpics(
  logWorkloadSubmissions,
  cancelWorkload,
  workloadTimer
);

export default epics;
