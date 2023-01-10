
/**
 * External dependencies
 */

import classnames from 'classnames';
import hexToRgba from 'hex-rgba';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	RichText,
	useBlockProps
} from '@wordpress/block-editor';

import { useSelect } from '@wordpress/data';

import {
	Fragment,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import Controls from './controls.js';
import Inspector from './inspector.js';
import themeIsleIcons from './../../../helpers/themeisle-icons';
import {
	blockInit,
	useCSSNode
} from '../../../helpers/block-utility.js';

const { attributes: defaultAttributes } = metadata;

/**
 * Button component
 * @param {import('./types').ButtonGroupButtonProps} props
 * @returns
 */
const Edit = ( props ) => {

	const {
		attributes,
		setAttributes,
		isSelected,
		clientId
	} = props;

	console.log( props );

	const {
		hasParent,
		parentAttributes
	} = useSelect( select => {
		const {
			getBlock,
			getBlockRootClientId
		} = select( 'core/block-editor' );

		const parentClientId = getBlockRootClientId( clientId );
		const parentBlock = getBlock( parentClientId );

		return {
			hasParent: parentBlock ? true : false,
			parentAttributes: parentBlock ? parentBlock.attributes : {}
		};
	}, []);

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );
		return () => unsubscribe( attributes.id );
	}, []);

	let boxShadowStyle = {};

	let buttonStyle = {};

	if ( attributes.boxShadow ) {
		boxShadowStyle = {
			boxShadow: `${ attributes.boxShadowHorizontal }px ${ attributes.boxShadowVertical }px ${ attributes.boxShadowBlur }px ${ attributes.boxShadowSpread }px ${ hexToRgba( ( attributes.boxShadowColor ? attributes.boxShadowColor : '#000000' ), attributes.boxShadowColorOpacity ) }`
		};
	}

	if ( hasParent ) {

		buttonStyle = {
			fontFamily: parentAttributes.fontFamily,
			fontWeight: parentAttributes.fontVariant,
			fontStyle: parentAttributes.fontStyle,
			textTransform: parentAttributes.textTransform,
			lineHeight: parentAttributes.lineHeight && `${ parentAttributes.lineHeight }px`
		};
	}

	const getCSSBasedOnStyle = () => {
		if ( attributes?.className?.includes( 'is-style-plain' ) ) {
			return {
				color: attributes.color
			};
		}
		if ( attributes?.className?.includes( 'is-style-outline' ) ) {
			return {
				color: attributes.color,
				border: `${ attributes.borderSize }px solid ${ attributes.border }`,
				borderRadius: attributes.borderRadius,
				...boxShadowStyle
			};
		}

		return {
			color: attributes.color,
			background: attributes.background || attributes.backgroundGradient,
			border: `${ attributes.borderSize }px solid ${ attributes.border }`,
			borderRadius: attributes.borderRadius,
			...boxShadowStyle
		};
	};

	const styles = {
		...getCSSBasedOnStyle(),
		...buttonStyle
	};

	const iconStyles = {
		fill: attributes.color,
		width: parentAttributes.fontSize && `${ parentAttributes.fontSize }px`
	};

	const Icon = themeIsleIcons.icons[ attributes.icon ];

	const [ cssNodeName, setCSSNode ] = useCSSNode();
	useEffect( () => {
		setCSSNode([
			`.wp-block-button__link:hover {
				color: ${ attributes.hoverColor } !important;
				background: ${ attributes.hoverBackground || attributes.hoverBackgroundGradient } !important;
				border-color: ${ attributes.hoverBorder } !important;
				${ attributes.boxShadow && `box-shadow: ${ attributes.hoverBoxShadowHorizontal }px ${ attributes.hoverBoxShadowVertical }px ${ attributes.hoverBoxShadowBlur }px ${ attributes.hoverBoxShadowSpread }px ${ hexToRgba( ( attributes.hoverBoxShadowColor ? attributes.hoverBoxShadowColor : '#000000' ), attributes.hoverBoxShadowColorOpacity ) } !important;` }
			}`,
			`.wp-block-button__link:hover svg {
				fill: ${ attributes.hoverColor } !important;
			}`
		]);
	}, [ attributes.hoverColor, attributes.hoverBackground, attributes.hoverBackgroundGradient, attributes.hoverBorder, attributes.hoverColor, attributes.boxShadow, attributes.hoverBoxShadowHorizontal, attributes.hoverBoxShadowBlur, attributes.hoverBoxShadowSpread, attributes.hoverBoxShadowColor, attributes.hoverBoxShadowColorOpacity ]);

	const blockProps = useBlockProps({
		id: attributes.id,
		className: classnames( 'wp-block-button', cssNodeName )
	});

	return (
		<Fragment>
			<Controls
				attributes={ attributes }
				setAttributes={ setAttributes }
				isSelected={ isSelected }
			/>

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				{ 'none' !== attributes.iconType ? (
					<div
						className="wp-block-button__link"
						style={ styles }
					>
						{ ( 'left' === attributes.iconType || 'only' === attributes.iconType ) && (
							'themeisle-icons' === attributes.library && attributes.icon ? (
								<Icon
									className={ classnames(
										{ 'margin-right': 'left' === attributes.iconType }
									) }
									style={ iconStyles }
								/>
							) : (
								<i
									className={ classnames(
										attributes.prefix,
										'fa-fw',
										`fa-${ attributes.icon }`,
										{ 'margin-right': 'left' === attributes.iconType }
									) }
								>
								</i>
							)
						) }

						{ 'only' !== attributes.iconType && (
							<RichText
								placeholder={ __( 'Add text…', 'otter-blocks' ) }
								value={ attributes.text }
								onChange={ value => setAttributes({ text: value }) }
								tagName="div"
								withoutInteractiveFormatting
							/>
						) }

						{ 'right' === attributes.iconType && (
							'themeisle-icons' === attributes.library && attributes.icon ? (
								<Icon
									className="margin-left"
									style={ iconStyles }
								/>
							) : (
								<i className={ `${ attributes.prefix } fa-fw fa-${ attributes.icon } margin-left` }></i>
							)
						) }
					</div>
				) : (
					<RichText
						placeholder={ __( 'Add text…', 'otter-blocks' ) }
						value={ attributes.text }
						onChange={ value => setAttributes({ text: value }) }
						tagName="div"
						withoutInteractiveFormatting
						className="wp-block-button__link"
						style={ styles }
					/>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
