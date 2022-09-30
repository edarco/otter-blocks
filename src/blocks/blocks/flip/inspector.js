/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { isEmpty, isNumber, pick } from 'lodash';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls,
	PanelColorSettings,
	MediaPlaceholder
} from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
	__experimentalBoxControl as BoxControl,
	FontSizePicker
} from '@wordpress/components';

import { Fragment, useState } from '@wordpress/element';

import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import ControlPanelControl from '../../components/control-panel-control/index.js';
import BackgroundSelectorControl from '../../components/background-selector-control/index.js';
import {
	buildResponsiveGetAttributes,
	buildResponsiveSetAttributes,
	mergeBoxDefaultValues,
	removeBoxDefaultValues,
	stringToBox
} from '../../helpers/helper-functions.js';
import InspectorHeader from '../../components/inspector-header/index.js';
import ButtonToggle from '../../components/button-toggle-control/index.js';
import { alignCenter, alignLeft, alignRight } from '@wordpress/icons';
import ToogleGroupControl from '../../components/toogle-group-control/index.js';
import ResponsiveControl from '../../components/responsive-control/index.js';
import { alignBottom, alignTop, alignCenter as oAlignCenter } from '../../helpers/icons.js';

const wrapNumberInString = ( x ) => isNumber( x ) ? `${x}px` : x;
const wrapNumberInBox = ( x ) => isNumber( x ) ? ({ top: wrapNumberInString( x ), bottom: wrapNumberInString( x ), left: wrapNumberInString( x ), right: wrapNumberInString( x ) }) : x;
const defaultFontSizes = [
	{
		name: '14',
		size: '14px',
		slug: '14'
	},
	{
		name: '16',
		size: '16px',
		slug: '16'
	},
	{
		name: '18',
		size: '18px',
		slug: '18'
	},
	{
		name: '24',
		size: '24px',
		slug: '24'
	}
];

/**
 *
 * @param {import('./types.js').FlipInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {

	const [ tab, setTab ] = useState( 'settings' );
	const [ side, setSide ] = useState( 'front' );

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

		return {
			responsiveSetAttributes: buildResponsiveSetAttributes( setAttributes, view ),
			responsiveGetAttributes: buildResponsiveGetAttributes( view )
		};
	}, []);

	const changeBoxShadowColor = value => {
		setAttributes({
			boxShadowColor: ( 100 > attributes.boxShadowColorOpacity && attributes.boxShadowColor?.includes( 'var(' ) ) ?
				getComputedStyle( document.documentElement, null ).getPropertyValue( value?.replace( 'var(', '' )?.replace( ')', '' ) ) :
				value
		});
	};

	const changeBoxShadowColorOpacity = value => {
		const changes = { boxShadowColorOpacity: value };
		if ( 100 > value && attributes.boxShadowColor?.includes( 'var(' ) ) {
			changes.boxShadowColor = getComputedStyle( document.documentElement, null ).getPropertyValue( attributes.boxShadowColor.replace( 'var(', '' ).replace( ')', '' ) );
		}
		setAttributes( changes );
	};

	return (
		<InspectorControls>
			<InspectorHeader
				value={ tab }
				options={[
					{
						label: __( 'Settings', 'otter-blocks' ),
						value: 'settings'
					},
					{
						label: __( 'Style', 'otter-blocks' ),
						value: 'style'
					}
				]}
				onChange={ setTab }
			/>
			<div>
				{
					'settings' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Flip Settings', 'otter-blocks' ) }
							>
								<SelectControl
									label={ __( 'Flip Type', 'otter-blocks' )}
									value={ attributes.animType }
									options={ [
										{ label: __( 'Bottom to Top', 'otter-blocks' ), value: 'flipX' },
										{ label: __( 'Left to right', 'otter-blocks' ), value: 'flipY' }
									]}
									onChange={ animType => setAttributes({ animType })}
								/>
								<ToggleControl
									label={ __( 'Invert the sides', 'otter-blocks' ) }
									checked={ attributes.isInverted }
									onChange={ isInverted => setAttributes({ isInverted })}
									help={ __( 'Use this to display the back side first.', 'otter-blocks' ) }
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Front side content', 'otter-blocks' ) }
							>
								<ButtonToggle
									label={ __( 'Content Type', 'otter-blocks' ) }
									options={[
										{
											label: __( 'None', 'otter-blocks' ),
											value: ''
										},
										{
											label: __( 'Image', 'otter-blocks' ),
											value: 'image'
										}
									]}
									value={ attributes?.frontContentType }
									onChange={ v => setAttributes({ frontContentType: v ? v : undefined }) }
								/>

								{
									'image' === attributes.frontContentType && (
										<Fragment>
											<BaseControl
												label={ __( 'Media Image', 'otter-blocks' ) }
												help={ __( 'Set an image as showcase.', 'otter-blocks' ) }
											>
												{ ! ( attributes.frontMedia?.url ) ? (
													<MediaPlaceholder
														labels={ {
															title: __( 'Media Image', 'otter-blocks' )
														} }
														accept="image/*"
														allowedTypes={ [ 'image' ] }
														value={ attributes.frontMedia }
														onSelect={ value => setAttributes({ frontMedia: pick( value, [ 'id', 'alt', 'url' ]) }) }
													/>
												) : (
													<BaseControl
													>
														<img
															src={ attributes.frontMedia.url }
															alt={ attributes.frontMedia.alt }
															style={{
																border: '2px solid var( --wp-admin-theme-color)',
																maxHeight: '250px'
															}}
														/>

														<Button
															isSecondary
															onClick={ () => setAttributes({ frontMedia: undefined }) }
														>
															{ __( 'Remove image', 'otter-blocks' ) }
														</Button>
													</BaseControl>
												) }
											</BaseControl>

											<UnitControl
												onChange={ frontMediaWidth => setAttributes({ frontMediaWidth }) }
												label={ __( 'Media Width', 'otter-blocks' ) }
												isUnitSelectTabbable
												isResetValueOnUnitChange
												value={ wrapNumberInString( attributes.frontMediaWidth ) }
											/>

											<UnitControl
												onChange={ frontMediaHeight => setAttributes({ frontMediaHeight }) }
												label={ __( 'Media Height', 'otter-blocks' ) }
												isUnitSelectTabbable
												isResetValueOnUnitChange
												value={ wrapNumberInString( attributes.frontMediaHeight ) }
											/>
										</Fragment>
									)
								}
							</PanelBody>
							<PanelBody
								title={__( 'Alignment', 'otter-blocks' )}
							>
								<ButtonToggle
									label={ __( 'Sides', 'otter-blocks' ) }
									options={[
										{
											label: __( 'Front', 'otter-blocks' ),
											value: 'front'
										},
										{
											label: __( 'Back', 'otter-blocks' ),
											value: 'back'
										}
									]}
									value={ side }
									onChange={ setSide }
								/>

								<BaseControl
									label={ __( 'Vertical Alignment', 'otter-blocks' ) }
								>
									<ToogleGroupControl

										options={[
											{
												icon: alignTop,
												value: 'flex-start'
											},
											{
												icon: oAlignCenter,
												value: 'center'
											},
											{
												icon: alignBottom,
												value: 'flex-end'
											}
										]}
										value={ attributes.frontVerticalAlign }
										onChange={ frontVerticalAlign => setAttributes({ frontVerticalAlign }) }
									/>
								</BaseControl>
								<BaseControl
									label={ __( 'Horizontal Alignment', 'otter-blocks' ) }
								>
									<ToogleGroupControl
										options={[
											{
												icon: alignLeft,
												value: 'flex-start'
											},
											{
												icon: alignCenter,
												value: 'center'
											},
											{
												icon: alignRight,
												value: 'flex-end'
											}
										]}
										value={ attributes.frontHorizontalAlign }
										onChange={ frontHorizontalAlign => setAttributes({ frontHorizontalAlign }) }
									/>

								</BaseControl>

							</PanelBody>
						</Fragment>
					)
				}
				{
					'style' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Dimensions', 'otter-blocks' ) }
							>
								<ResponsiveControl
									label={ __( 'Width', 'otter-blocks' ) }
								>
									<UnitControl
										value={ responsiveGetAttributes([ attributes?.width?.desktop ?? wrapNumberInString( attributes.width ), attributes.width?.tablet, attributes?.width?.mobile ]) ?? '100%' }
										onChange={ width => responsiveSetAttributes( width, [ 'width.desktop', 'width.tablet', 'width.mobile' ], attributes.width ) }

										isUnitSelectTabbable
										isResetValueOnUnitChange
										allowReset={ true }
									/>
								</ResponsiveControl>

								<ResponsiveControl
									label={ __( 'Height', 'otter-blocks' ) }
								>
									<UnitControl
										value={ responsiveGetAttributes([ attributes?.height?.desktop ?? wrapNumberInString( attributes.height ), attributes.height?.tablet, attributes?.height?.mobile ]) ?? '300px' }
										onChange={ height => responsiveSetAttributes( height, [ 'height.desktop', 'height.tablet', 'height.mobile' ], attributes.height ) }
										isUnitSelectTabbable
										isResetValueOnUnitChange
										allowReset={ true }
									/>
								</ResponsiveControl>

								<ResponsiveControl
									label={ __( 'Padding', 'otter-blocks' ) }
								>
									<BoxControl
										values={
											responsiveGetAttributes([ attributes?.padding?.desktop ?? wrapNumberInString( attributes.padding ), attributes.padding?.tablet, attributes?.padding?.mobile ]) ?? stringToBox( '20px' )
										}
										onChange={ value => {
											if ( 'object' === typeof value ) {
												value = Object.fromEntries( Object.entries( value ).filter( ([ _, v ]) => null !== v ) );
											}

											if ( isEmpty( value ) ) {
												value = undefined;
											}

											responsiveSetAttributes( value, [ 'padding.desktop', 'padding.tablet', 'padding.mobile' ], attributes.padding );
										} }
									/>
								</ResponsiveControl>

							</PanelBody>
							<PanelBody
								title={ __( 'Typography Front Side', 'otter-blocks' ) }
							>
								<FontSizePicker
									label={ __( 'Title', 'otter-blocks' ) }
									value={ wrapNumberInString( attributes.titleFontSize ) }
									onChange={ titleFontSize => setAttributes({ titleFontSize }) }
									fontSizes={[ ...defaultFontSizes, { name: '32', size: '32px', slug: '32' }]}
									allowReset
								/>

								<FontSizePicker
									label={ __( 'Description', 'otter-blocks' ) }
									value={ wrapNumberInBox( attributes.descriptionFontSize ) }
									onChange={ descriptionFontSize => setAttributes({ descriptionFontSize }) }
									fontSizes={[ ...defaultFontSizes, { name: '28', size: '28px', slug: '28' }]}
									allowReset
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Front side', 'otter-blocks' ) }
							>
								<BackgroundSelectorControl
									backgroundType={ attributes.frontBackgroundType }
									backgroundColor={ attributes.frontBackgroundColor }
									image={ attributes.frontBackgroundImage }
									gradient={ attributes.frontBackgroundGradient }
									focalPoint={ attributes.frontBackgroundPosition }
									backgroundAttachment={ attributes.frontBackgroundAttachment }
									backgroundRepeat={ attributes.frontBackgroundRepeat }
									backgroundSize={ attributes.frontBackgroundSize }
									changeBackgroundType={ frontBackgroundType => setAttributes({ frontBackgroundType }) }
									changeImage={ media => {
										setAttributes({
											frontBackgroundImage: pick( media, [ 'id', 'url' ])
										});
									}}
									removeImage={ () => setAttributes({ frontBackgroundImage: undefined })}
									changeColor={ frontBackgroundColor => setAttributes({ frontBackgroundColor })}
									changeGradient={ frontBackgroundGradient => setAttributes({ frontBackgroundGradient }) }
									changeBackgroundAttachment={ frontBackgroundAttachment => setAttributes({ frontBackgroundAttachment })}
									changeBackgroundRepeat={ frontBackgroundRepeat => setAttributes({ frontBackgroundRepeat })}
									changeFocalPoint={ frontBackgroundPosition => setAttributes({ frontBackgroundPosition }) }
									changeBackgroundSize={ frontBackgroundSize => setAttributes({ frontBackgroundSize }) }
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Back side', 'otter-blocks' ) }
							>
								<BackgroundSelectorControl
									backgroundType={ attributes.backBackgroundType }
									backgroundColor={ attributes.backBackgroundColor }
									image={ attributes.backBackgroundImage }
									gradient={ attributes.backBackgroundGradient }
									focalPoint={ attributes.backBackgroundPosition }
									backgroundAttachment={ attributes.backBackgroundAttachment }
									backgroundRepeat={ attributes.backBackgroundRepeat }
									backgroundSize={ attributes.backBackgroundSize }
									changeBackgroundType={ backBackgroundType => setAttributes({ backBackgroundType }) }
									changeImage={ media => {
										setAttributes({
											backBackgroundImage: pick( media, [ 'id', 'url' ])
										});
									}}
									removeImage={ () => setAttributes({ backBackgroundImage: undefined })}
									changeColor={ backBackgroundColor => setAttributes({ backBackgroundColor })}
									changeGradient={ backBackgroundGradient => setAttributes({ backBackgroundGradient }) }
									changeBackgroundAttachment={ backBackgroundAttachment => setAttributes({ backBackgroundAttachment })}
									changeBackgroundRepeat={ backBackgroundRepeat => setAttributes({ backBackgroundRepeat })}
									changeFocalPoint={ backBackgroundPosition => setAttributes({ backBackgroundPosition }) }
									changeBackgroundSize={ backBackgroundSize => setAttributes({ backBackgroundSize }) }
								/>
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Color', 'otter-blocks' ) }
								initialOpen={ false }
								colorSettings={ [
									{
										value: attributes.borderColor,
										onChange: borderColor => setAttributes({ borderColor }),
										label: __( 'Border Color', 'otter-blocks' )
									},
									{
										value: attributes.titleColor,
										onChange: titleColor => setAttributes({ titleColor }),
										label: __( 'Title Color', 'otter-blocks' )
									},
									{
										value: attributes.descriptionColor,
										onChange: descriptionColor => setAttributes({ descriptionColor }),
										label: __( 'Description Color', 'otter-blocks' )
									}
								] }
							/>
							<PanelBody
								title={ __( 'Border', 'otter-blocks' ) }
								initialOpen={ false }
							>

								<BoxControl
									label={ __( 'Border Width', 'otter-blocks' ) }
									values={
										mergeBoxDefaultValues(
											wrapNumberInBox( attributes.borderWidth ),
											{ left: '0px', right: '0px', bottom: '0px', top: '0px' }
										)
									}
									onChange={ value => {
										setAttributes({
											borderWidth: removeBoxDefaultValues( value, { left: '0px', right: '0px', bottom: '0px', top: '0px' })
										});
									} }
								/>

								<BoxControl
									label={ __( 'Border Radius', 'otter-blocks' ) }
									values={
										mergeBoxDefaultValues(
											wrapNumberInBox( attributes.borderRadius ),
											{ left: '0px', right: '0px', bottom: '0px', top: '0px' }
										)
									}
									onChange={ value => {
										setAttributes({
											borderRadius: removeBoxDefaultValues( value, { left: '0px', right: '0px', bottom: '0px', top: '0px' })
										});
									} }
									id="o-border-raduis-box"
								/>

								<ToggleControl
									label={ __( 'Shadow Properties', 'otter-blocks' ) }
									checked={ attributes.boxShadow }
									onChange={ boxShadow => setAttributes({ boxShadow }) }
								/>

								{ attributes.boxShadow && (
									<Fragment>
										<ColorGradientControl
											label={ __( 'Color', 'otter-blocks' ) }
											colorValue={ attributes.boxShadowColor }
											onColorChange={ changeBoxShadowColor }
										/>

										<ControlPanelControl
											label={ __( 'Shadow Properties', 'otter-blocks' ) }
										>
											<RangeControl
												label={ __( 'Opacity', 'otter-blocks' ) }
												value={ attributes.boxShadowColorOpacity }
												onChange={ changeBoxShadowColorOpacity }
												min={ 0 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Blur', 'otter-blocks' ) }
												value={ attributes.boxShadowBlur }
												onChange={ boxShadowBlur => setAttributes({ boxShadowBlur }) }
												min={ 0 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Horizontal', 'otter-blocks' ) }
												value={ attributes.boxShadowHorizontal }
												onChange={ boxShadowHorizontal => setAttributes({ boxShadowHorizontal })}
												min={ -100 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Vertical', 'otter-blocks' ) }
												value={ attributes.boxShadowVertical }
												onChange={ boxShadowVertical => setAttributes({ boxShadowVertical }) }
												min={ -100 }
												max={ 100 }
											/>
										</ControlPanelControl>
									</Fragment>
								) }
							</PanelBody>
						</Fragment>
					)
				}
			</div>
		</InspectorControls>
	);
};

export default Inspector;
