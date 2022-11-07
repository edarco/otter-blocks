/**
 * External dependencies
 */
import hash from 'object-hash';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

import { registerStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getQueryStringFromObject } from '../../helpers/helper-functions.js';

const DEFAULT_STATE = {
	showOnboarding: Boolean( window.themeisleGutenberg.showOnboarding ) && 'false' !== window.localStorage?.getItem( 'o-show-onboarding' ),
	isBFDealVisible: Boolean( window.themeisleGutenberg.showBFDeal ) && 'false' !== window.localStorage?.getItem( 'o-show-bf-deal' ),
	viewType: 'Desktop',
	visiblePopover: 'themeisle-blocks/dynamic-value',
	dynamicData: {}
};

const actions = {
	updateView( viewType ) {
		return {
			type: 'UPDATE_VIEW',
			viewType
		};
	},
	showOnboarding( showOnboarding ) {
		return {
			type: 'UPDATE_ONBOARDING',
			showOnboarding
		};
	},
	showBFDeal( isBFDealVisible ) {
		return {
			type: 'UPDATE_BF_DEAL',
			isBFDealVisible
		};
	},
	setVisiblePopover( visiblePopover ) {
		return {
			type: 'UPDATE_POPOVER',
			visiblePopover
		};
	},
	setDynamicData( key, value ) {
		return {
			type: 'SET_DYNAMIC_DATA',
			key,
			value
		};
	},
	fetchFromAPI( path ) {
		return {
			type: 'FETCH_FROM_API',
			path
		};
	}
};

registerStore( 'themeisle-gutenberg/data', {
	reducer( state = DEFAULT_STATE, action ) {
		if ( 'UPDATE_VIEW' === action.type ) {
			return {
				viewType: action.viewType
			};
		}

		if ( 'UPDATE_ONBOARDING' === action.type ) {
			return {
				showOnboarding: action.showOnboarding
			};
		}

		if ( 'UPDATE_BF_DEAL' === action.type ) {
			return {
				isBFDealVisible: action.isBFDealVisible
			};
		}

		if ( 'UPDATE_POPOVER' === action.type ) {
			return {
				visiblePopover: action.visiblePopover
			};
		}

		if ( 'SET_DYNAMIC_DATA' === action.type ) {
			return {
				dynamicData: {
					...state.dynamicData,
					[ action.key ]: action.value
				}
			};
		}

		return state;
	},

	actions,

	selectors: {
		getView( state ) {
			return state.viewType;
		},
		isOnboardingVisible( state ) {
			return state.showOnboarding;
		},
		isBFDealVisible( state ) {
			return state.isBFDealVisible;
		},
		getVisiblePopover( state ) {
			return state.visiblePopover;
		},
		getDynamicData( state, attrs ) {
			const key  = hash( attrs );
			return state.dynamicData[ key ];
		}
	},

	controls: {
		FETCH_FROM_API( action ) {
			return apiFetch({ path: action.path });
		}
	},

	resolvers: {
		*getDynamicData( attrs ) {
			const key = hash( attrs );
			const path = 'otter/v1/dynamic/preview/?' + getQueryStringFromObject( attrs );
			const value = yield actions.fetchFromAPI( path );
			return actions.setDynamicData( key, value );
		}
	}
});
