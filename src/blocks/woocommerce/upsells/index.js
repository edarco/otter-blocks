/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

import { Placeholder } from '@wordpress/components';

import { store as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';

const { name } = metadata;

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) ) {
	registerBlockType( name, {
		...metadata,
		title: __( 'Product Upsells', 'otter-blocks' ),
		description: __( 'Display upsells for your WooCommerce product.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'products',
			'upsells'
		],
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'Upsell products will be displayed here on the product page.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
} else {
	registerBlockType( name, {
		...metadata,
		title: __( 'Product Upsells', 'otter-blocks' ),
		description: __( 'Display upsells for your WooCommerce product.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'products',
			'upsells'
		],
		supports: {
			inserter: false
		},
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Upsell Products block.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}