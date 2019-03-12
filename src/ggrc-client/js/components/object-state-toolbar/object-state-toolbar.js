/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import {SWITCH_TO_ERROR_PANEL, SHOW_INVALID_FIELD} from '../../events/eventTypes';
import template from './object-state-toolbar.stache';

const tag = 'object-state-toolbar';
const activeStates = ['In Progress', 'Rework Needed', 'Not Started'];

/**
 * Object State Toolbar Component allowing Object state modification
 */
export default can.Component.extend({
  tag,
  template,
  leakScope: true,
  viewModel: {
    define: {
      updateState: {
        get: function () {
          return this.attr('hasVerifiers') ? 'In Review' : 'Completed';
        },
      },
      showVerifyButtons: {
        get() {
          if (this.attr('freezeChanges')) {
            return this.attr('lastFreezedData.isCurrentUserVerifier');
          }

          return this.attr('isCurrentUserVerifier');
        },
      },
      isCurrentUserVerifier: {
        get: function () {
          let verifiers = this.attr('verifiers');
          return !!_.find(verifiers, (verifier) =>
            verifier.id === GGRC.current_user.id);
        },
      },
      hasVerifiers: {
        get: function () {
          return this.attr('verifiers').length;
        },
      },
    },
    freezeChanges: false,
    lastFreezedData: {
      isCurrentUserVerifier: null,
    },
    instanceState: '',
    disabled: false,
    isUndoButtonVisible: false,
    isVerifyBtnDisabled: false,
    verifiers: [],
    instance: {},
    isActiveState: function () {
      return activeStates.includes(this.attr('instanceState'));
    },
    isInProgress: function () {
      return this.attr('instanceState') === 'In Progress';
    },
    isInReview: function () {
      return this.attr('instanceState') === 'In Review';
    },
    changeState: function (newState, isUndo) {
      if (this.attr('instance._hasValidationErrors')) {
        this.attr('instance').dispatch(SWITCH_TO_ERROR_PANEL);
        this.attr('instance').dispatch(SHOW_INVALID_FIELD);
        return;
      }

      newState = newState || this.attr('updateState');
      this.dispatch({
        type: 'onStateChange',
        state: newState,
        undo: isUndo,
      });
    },
  },
  events: {
    '{viewModel} freezeChanges'() {
      const vm = this.viewModel;

      if (vm.attr('freezeChanges')) {
        vm.attr('lastFreezedData.isCurrentUserVerifier',
          vm.attr('isCurrentUserVerifier')
        );
      }
    },
  },
});
