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


export const epics = combineEpics(
  logWorkloadSubmissions,
);

export default epics;
