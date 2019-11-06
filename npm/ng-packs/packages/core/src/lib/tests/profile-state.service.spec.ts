import { createServiceFactory, SpectatorService, SpyObject } from '@ngneat/spectator/jest';
import { ProfileStateService } from '../services/profile-state.service';
import { ProfileState } from '../states/profile.state';
import { Store } from '@ngxs/store';
describe('ProfileStateService', () => {
  let service: ProfileStateService;
  let spectator: SpectatorService<ProfileStateService>;
  let store: SpyObject<Store>;

  const createService = createServiceFactory({ service: ProfileStateService, mocks: [Store] });
  beforeEach(() => {
    spectator = createService();
    service = spectator.service;
    store = spectator.get(Store);
  });
  test('should have the all ProfileState static methods', () => {
    const reg = /(?<=static )(.*)(?=\()/gm;
    ProfileState.toString()
      .match(reg)
      .forEach(fnName => {
        expect(service[fnName]).toBeTruthy();

        const spy = jest.spyOn(store, 'selectSnapshot');
        spy.mockClear();

        const isDynamicSelector = ProfileState[fnName].name !== 'memoized';

        if (isDynamicSelector) {
          ProfileState[fnName] = jest.fn((...args) => args);
          service[fnName]('test', 0, {});
          expect(ProfileState[fnName]).toHaveBeenCalledWith('test', 0, {});
        } else {
          service[fnName]();
          expect(spy).toHaveBeenCalledWith(ProfileState[fnName]);
        }
      });
  });
});