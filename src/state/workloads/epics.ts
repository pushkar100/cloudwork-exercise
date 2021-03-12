import { combineEpics, Epic } from 'redux-observable';
import { filter, mergeMap, map, tap, ignoreElements } from 'rxjs/operators';
import { from } from 'rxjs';
import { isActionOf } from 'typesafe-actions';

import { RootAction, RootState } from '../reducer';
import * as workloadsActions from './actions';
import { WorkloadService } from './services'

const workloadService = new WorkloadService

type AppEpic = Epic<RootAction, RootAction, RootState>;

const logWorkloadSubmissions: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.submit)),
    mergeMap(async (action) => {
      const createdTask = await workloadService.create(action.payload)
      return workloadsActions.created(createdTask)
    })
  )
);

const cancelWorkload: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.cancel)),
    mergeMap(async (action) => {
      const currentWork = await workloadService.checkStatus(action.payload)
      if (!['SUCCESS', 'FAILURE'].includes(currentWork.status)) {
        const work = await workloadService.cancel(action.payload)
        return workloadsActions.updateStatus(work) 
      } else {
        return workloadsActions.updateStatus(currentWork) 
      }
    })
  )
);

export const epics = combineEpics(
  logWorkloadSubmissions,
  cancelWorkload
);

export default epics;
