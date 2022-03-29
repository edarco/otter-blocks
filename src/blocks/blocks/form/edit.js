/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { get } from 'lodash';

import api from '@wordpress/api';

import {
	__experimentalBlockVariationPicker as VariationPicker,
	InnerBlocks,
	useBlockProps
} from '@wordpress/block-editor';

import {
	createBlock,
	createBlocksFromInnerBlocksTemplate
} from '@wordpress/blocks';

import {
	dispatch,
	select,
	useSelect,
	useDispatch
} from '@wordpress/data';

import {
	Fragment,
	useState,
	useEffect,
	useRef,
	createContext
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { blockInit } from '../../helpers/block-utility.js';
import Inspector from './inspector.js';
import Placeholder from './placeholder.js';
import { Button } from '@wordpress/components';
const { attributes: defaultAttributes } = metadata;

export const FormContext = createContext({});

/**
 * Form component
 * @param {import('./type').FormProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	name
}) => {
	const [ googleCaptchaAPISiteKey, setGoogleCaptchaAPISiteKey ] = useState( '' );
	const [ googleCaptchaAPISecretKey, setGoogleCaptchaAPISecretKey ] = useState( '' );
	const [ isAPILoaded, setAPILoaded ] = useState( false );
	const [ isAPISaved, setAPISaved ] = useState( false );

	const [ apiKey, setApiKey ] = useState( '' );
	const [ fetchApiKeyStatus, setFetchApiKeyStatus ] = useState( 'loading' );
	const [ email, setEmail ] = useState( '' );
	const [ savedEmail, setSavedEmail ] = useState( '' );
	const [ isEmailLoaded, setEmailLoading ] = useState( true );
	const [ listIDOptions, setListIDOptions ] = useState([ { label: __( 'None', 'otter-blocks' ), value: '' } ]);
	const [ fetchListIdStatus, setFetchListIdStatus ] = useState( 'loading' );

	const settingsRef = useRef( null );
	const [ areSettingsAvailable, setSettingsStatus ] = useState( false );

	const {
		insertBlock,
		removeBlock
	} = useDispatch( 'core/block-editor' );

	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );
	const { createNotice } = dispatch( 'core/notices' );

	const hasInnerBlocks = useSelect(
		select =>
			0 < select( 'core/block-editor' ).getBlocks( clientId ).length,
		[ clientId ]
	);

	const { blockType, defaultVariation, variations } = useSelect(
		select => {
			const {
				getBlockVariations,
				getBlockType,
				getDefaultBlockVariation
			} = select( 'core/blocks' );

			return {
				blockType: getBlockType( name ),
				defaultVariation: getDefaultBlockVariation( name, 'block' ),
				variations: getBlockVariations( name, 'block' )
			};
		},
		[ name ]
	);

	const children = useSelect( select => {
		const {
			getBlock
		} = select( 'core/block-editor' );
		return getBlock( clientId ).innerBlocks;
	});

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	/**
	 * Create the form identification tag for Otter Options.
	 */
	useEffect( () => {
		if ( attributes.id && select( 'core/edit-widgets' ) ) {
			setAttributes({ optionName: `widget_${ attributes.id.slice( -8 ) }` });
		} else if ( attributes.id && Boolean( window.themeisleGutenberg.isBlockEditor ) && select( 'core/editor' )?.getCurrentPostId() ) {
			setAttributes({ optionName: `${ select( 'core/editor' ).getCurrentPostId() }_${ attributes.id.slice( -8 ) }` });
		}
	}, [ attributes.id ]);

	/**
	 * Make sure that a form nonce field is always present.
	 */
	useEffect( () => {
		if ( children ) {
			const verificationBlocks = children.filter( ({ name }) => 'themeisle-blocks/form-nonce' === name );

			if ( 2 <= verificationBlocks?.length ) {
				verificationBlocks.slice( 1 ).forEach( block => {
					removeBlock( block.clientId, false );
				});
			} else if ( 0 === verificationBlocks?.length && clientId ) {
				const nonceBlock = createBlock( 'themeisle-blocks/form-nonce' );
				if ( nonceBlock ) {
					insertBlock?.( nonceBlock, ( children?.length ) || 0, clientId, false );
				}
			}
		}
	}, [ children ]);

	/**
	 * Load settings.
	 */
	useEffect( () => {
		api.loadPromise.then( () => {
			settingsRef.current = new api.models.Settings();
			setSettingsStatus( true );
		});
	}, []);

	/**
	 * Load Email and ApiKey from server.
	 */
	useEffect( () => {
		const t = setTimeout( () => {
			setFetchApiKeyStatus( 'loaded' );
		}, 3000 );

		if ( attributes.optionName ) {
			api.loadPromise.then( () => {
				( new api.models.Settings() ).fetch().done( res => {
					res.themeisle_blocks_form_emails?.filter( ({ form }) => form === attributes.optionName )?.forEach( item => {
						console.log( item );
						setEmail( item?.email );
						setApiKey( item?.integration?.apiKey );
						setEmailLoading( true );
						setSavedEmail( item?.email );
						setFetchApiKeyStatus( 'loaded' );
						clearTimeout( t );
					});
				});
			});
		}

		return () => {
			clearTimeout( t );
		};
	}, [ attributes.optionName ]);


	/**
	 * Save the captcha option in settings.
	 */
	useEffect( () => {
		let controller = new AbortController();
		if ( attributes.hasCaptcha !== undefined ) {
			settingsRef?.current?.fetch({ signal: controller.signal }).done( res => {
				controller = null;

				const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
				let isMissing = true;
				let hasChanged = false;

				emails?.forEach( ({ form }, index ) => {
					if ( form === attributes.optionName ) {
						if ( emails[index].hasCaptcha !== attributes.hasCaptcha ) {
							hasChanged = true;
						}
						emails[index].hasCaptcha = attributes.hasCaptcha;
						isMissing = false;
					}
				});

				if ( isMissing ) {
					emails.push({
						form: attributes.optionName,
						hasCaptcha: attributes.hasCaptcha
					});
				}

				if ( isMissing || hasChanged ) {
					const model = new api.models.Settings({
						// eslint-disable-next-line camelcase
						themeisle_blocks_form_emails: emails
					});

					model.save();

					createNotice(
						'info',
						__( 'Form preference has been saved.', 'otter-blocks' ),
						{
							isDismissible: true,
							type: 'snackbar'
						}
					);
				}
			});
		}
		return () => controller?.abort();
	}, [ attributes.hasCaptcha,  attributes.redirectLink, settingsRef.current ]);

	/**
	 * Check if the API Keys are set.
	 */
	useEffect( () => {
		let controller = new AbortController();
		const getAPIData = () => {
			if ( ! isAPILoaded ) {
				settingsRef?.current?.fetch({ signal: controller.signal }).then( response => {
					controller = null;
					setAPILoaded( true );

					if ( '' !== response.themeisle_google_captcha_api_site_key && '' !== response.themeisle_google_captcha_api_secret_key ) {
						setAPISaved( true );
					}
				});
			}
		};

		if ( areSettingsAvailable && attributes.hasCaptcha && ! isAPISaved ) {
			getAPIData();
		}

		return () => controller?.abort();
	}, [ areSettingsAvailable, isAPILoaded, isAPISaved, attributes.hasCaptcha ]);

	/**
	 * Save API Keys in the Otter options.
	 */
	const saveCaptchaAPIKey = () => {
		const model = new window.wp.api.models.Settings({
			// eslint-disable-next-line camelcase
			themeisle_google_captcha_api_site_key: googleCaptchaAPISiteKey,
			// eslint-disable-next-line camelcase
			themeisle_google_captcha_api_secret_key: googleCaptchaAPISecretKey
		});

		model.save().then( response => {
			let saved = false;

			if ( '' !== response.themeisle_google_captcha_api_site_key && '' !== response.themeisle_google_captcha_api_secret_key ) {
				saved = true;
			}

			setAPISaved( saved );
			setGoogleCaptchaAPISecretKey( '' );
			setGoogleCaptchaAPISiteKey( '' );

			createNotice(
				'info',
				__( 'API Keys have been saved.', 'otter-blocks' ),
				{
					isDismissible: true,
					type: 'snackbar'
				}
			);
		});
	};

	/**
	 * Save integration data.
	 */
	useEffect( () => {
		let controller = new AbortController();
		settingsRef?.current?.fetch({ signal: controller.signal }).done( res => {
			controller = null;
			const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
			let isMissing = true;
			let hasUpdated = false;
			let hasUpdatedNotice = false;

			emails?.forEach( ({ form }, index ) => {
				if ( form === attributes.optionName ) {
					if ( ! emails[index]?.integration ) {
						emails[index].integration = {};
					}

					hasUpdated = emails[index].integration.provider !== attributes.provider || emails[index].integration.listId !== attributes.listId || emails[index].integration.action !== attributes.action;
					isMissing = false;
					hasUpdatedNotice =  ( emails[index].integration.listId !== attributes.listId || emails[index].integration.action !== attributes.action );

					emails[index].integration.provider = attributes.provider;
					emails[index].integration.listId = attributes.listId;
					emails[index].integration.action = attributes.action;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					integration: {
						provider: attributes.provider,
						listId: attributes.listId,
						action: attributes.action
					}
				});
			}

			if ( isMissing || hasUpdated ) {
				const model = new api.models.Settings({
					// eslint-disable-next-line camelcase
					themeisle_blocks_form_emails: emails
				});

				model.save().then( () => {
					if ( hasUpdatedNotice ) {
						createNotice(
							'info',
							__( 'Integration details have been saved.', 'otter-blocks' ),
							{
								isDismissible: true,
								type: 'snackbar'
							}
						);
					}
				});
			}
		});

		return () => controller?.abort();
	}, [ attributes.optionName, attributes.provider, apiKey, attributes.listId, attributes.action, settingsRef.current ]);

	useEffect( () => {
		let controller = new AbortController();
		if ( apiKey && attributes.provider ) {
			window.wp.apiFetch({
				path: 'otter/v1/form/editor',
				method: 'POST',
				data: {
					handler: 'listId',
					payload: {
						provider: attributes.provider,
						apiKey,
						action: attributes.action
					}
				},
				signal: controller.signal
			}).then(
				res => {
					controller = null;
					if ( res?.success ) {
						const options = res?.list_id?.map( item => {
							return {
								label: item.name,
								value: item.id?.toString()
							};
						}) || [];
						options.splice( 0, 0, { label: __( 'None', 'otter-blocks' ), value: '' });
						setListIDOptions( options );
						setFetchListIdStatus( 'ready' );

						const isCurrentOptionValid = 1 === options.map( ({ value }) => value ).filter( value => value === attributes.listId ).length;
						if ( attributes.listId && ! isCurrentOptionValid ) {
							createNotice(
								'error',
								__( 'The current contact list is invalid! Please choose a new contact list.', 'otter-blocks' ),
								{
									isDismissible: true,
									type: 'snackbar'
								}
							);
						}
					} else {
						createNotice(
							'error',
							res?.error,
							{
								isDismissible: true,
								type: 'snackbar',
								id: 'themeisle-form-server-error'
							}
						);

						setFetchListIdStatus( 'error' );
					}
				});
		}
		return () => controller?.abort();
	}, [ apiKey ]);

	const saveFormOptions = () => {
		( new api.models.Settings() ).fetch().done( res => {
			const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
			let isMissing = true;
			let hasUpdated = false;

			emails?.forEach( ({ form }, index ) => {
				if ( form === attributes.optionName ) {
					if ( emails[index].email !== email ) {
						emails[index].email = email; // update the value
						hasUpdated = true;
					}
					if ( emails[index].redirectLink !== attributes.redirectLink ) {
						emails[index].redirectLink = attributes.redirectLink; // update the value
						hasUpdated = true;
					}
					if ( emails[index].emailSubject !== attributes.subject ) {
						emails[index].emailSubject = attributes.subject; // update the value
						hasUpdated = true;
					}
					if ( emails[index].submitMessage !== attributes.submitMessage ) {
						emails[index].submitMessage = attributes.submitMessage; // update the value
						hasUpdated = true;
					}
					isMissing = false;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					email,
					redirectLink: attributes.redirectLink,
					emailSubject: attributes.subject,
					submitMessage: attributes.submitMessage
				});
			}

			if ( isMissing || hasUpdated ) {
				const model = new api.models.Settings({
					// eslint-disable-next-line camelcase
					themeisle_blocks_form_emails: emails
				});

				setEmailLoading( false );

				model.save().then( response => {
					response.themeisle_blocks_form_emails?.filter( ({ form }) => form === attributes.optionName ).forEach( item => {
						{
							setEmailLoading( true );
							setSavedEmail( item?.email );

							createNotice(
								'info',
								__( 'Form Options has been saved!', 'otter-blocks' ),
								{
									isDismissible: true,
									type: 'snackbar'
								}
							);
						}
					});
				});
			}
		});
	};

	const saveIntegrationApiKey = ( apiKey ) => {
		settingsRef?.current?.fetch().done( res => {
			const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
			let isMissing = true;
			let hasUpdated = false;
			let hasUpdatedNotice = false;

			emails?.forEach( ({ form }, index ) => {
				if ( form === attributes.optionName ) {
					if ( ! emails[index]?.integration ) {
						emails[index].integration = {};
					}

					hasUpdated = emails[index].integration.apiKey !== apiKey;
					hasUpdatedNotice = emails[index].integration.apiKey !== apiKey;

					emails[index].integration.apiKey = apiKey;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					integration: {
						provider: attributes.provider,
						apiKey: apiKey,
						listId: attributes.listId,
						action: attributes.action
					}
				});
			}

			if ( isMissing || hasUpdated ) {
				const model = new api.models.Settings({
					// eslint-disable-next-line camelcase
					themeisle_blocks_form_emails: emails
				});

				model.save().then( () => {
					if ( hasUpdatedNotice ) {
						createNotice(
							'info',
							__( 'The API Key has been saved.', 'otter-blocks' ),
							{
								isDismissible: true,
								type: 'snackbar'
							}
						);
					}
				});
			}
		});
	};


	const blockProps = useBlockProps({
		id: attributes.id
	});

	const blockRef = useRef( null );

	useEffect( () => {
		const px = x => x ? x + 'px' : null;
		const per = x => x ? x + '%' : null;

		/**
		 * TODO: Refactor this based on #748
		 */

		if ( blockRef.current ) {
			blockRef.current?.style?.setProperty( '--padding', px( attributes.inputPadding ) );
			blockRef.current?.style?.setProperty( '--borderRadius', px( attributes.inputBorderRadius ) );
			blockRef.current?.style?.setProperty( '--borderWidth', px( attributes.inputBorderWidth ) );
			blockRef.current?.style?.setProperty( '--borderColor', attributes.inputBorderColor || null );
			blockRef.current?.style?.setProperty( '--labelColor', attributes.labelColor || null );
			blockRef.current?.style?.setProperty( '--inputWidth', per( attributes.inputWidth ) );
			blockRef.current?.style?.setProperty( '--submitBackground', attributes.submitBackgroundColor || null );
			blockRef.current?.style?.setProperty( '--submitBackgroundHover', attributes.submitBackgroundColorHover || null );
			blockRef.current?.style?.setProperty( '--submitColor', attributes.submitColor || null );
			blockRef.current?.style?.setProperty( '--submitMsgColor', attributes.submitMessageColor || null );
			blockRef.current?.style?.setProperty( '--inputGap', px( attributes.inputGap ) );
			blockRef.current?.style?.setProperty( '--inputsGap', px( attributes.inputsGap ) );
		}
	}, [ blockRef.current, attributes ]);

	useEffect( () => {
		console.log( apiKey );
	}, [ apiKey ]);

	return (
		<Fragment>
			<FormContext.Provider
				value={{
					savedEmail,
					apiKey,
					setApiKey,
					isEmailLoaded,
					listIDOptions,
					setListIDOptions,
					fetchListIdStatus,
					setFetchListIdStatus,
					saveFormOptions,
					email,
					setEmail,
					saveIntegrationApiKey,
					fetchApiKeyStatus
				}}
			>
				<Inspector
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>

				<div { ...blockProps }>
					{
						( hasInnerBlocks ) ? (
							<form ref={blockRef} className="otter-form__container">
								<InnerBlocks
								/>

								{
									attributes.hasCaptcha && ( ! isAPILoaded || ! isAPISaved ) && (
										<Placeholder
											className="otter-form-captcha"
											isAPILoaded={ isAPILoaded }
											isAPISaved={ isAPISaved }
											saveAPIKey={ saveCaptchaAPIKey }
											siteKey={ googleCaptchaAPISiteKey }
											secretKey={ googleCaptchaAPISecretKey }
											setSiteKey={ setGoogleCaptchaAPISiteKey }
											setSecretKey={ setGoogleCaptchaAPISecretKey }
										/>
									)
								}

								<div className="wp-block-button has-submit-msg">
									<button
										className='components-button o-form-submit'
										type='submit'
									>
										{ attributes.submitLabel ? attributes.submitLabel : __( 'Submit', 'otter-blocks' ) }
									</button>

									<div className="o-form-server-response success">
										{ attributes.submitMessage || __( 'Success', 'otter-blocks' ) }
									</div>
								</div>
							</form>
						) : (
							<VariationPicker
								icon={ get( blockType, [ 'icon', 'src' ]) }
								label={ get( blockType, [ 'title' ]) }
								variations={ variations }
								onSelect={ ( nextVariation = defaultVariation ) => {
									if ( nextVariation ) {
										replaceInnerBlocks(
											clientId,
											createBlocksFromInnerBlocksTemplate(
												nextVariation.innerBlocks
											),
											true
										);
									}
								} }
								allowSkip
							/>
						)
					}
				</div>
			</FormContext.Provider>
		</Fragment>
	);
};

export default Edit;
