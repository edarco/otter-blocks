<?php
/**
 * Css handling logic for blocks.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Popup_CSS
 */
class Popup_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'popup';

	/**
	 * Generate Popup CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.7.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--min-width',
						'value'    => 'minWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--max-width',
						'value'    => 'maxWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--background-color',
						'value'    => 'backgroundColor',
					),
					array(
						'property' => '--close-color',
						'value'    => 'closeColor',
					),
					array(
						'property' => '--overlay-color',
						'value'    => 'overlayColor',
					),
					array(
						'property' => '--overlay-opacity',
						'value'    => 'overlayOpacity',
						'format'   => function( $value ) {
							return $value / 100;
						},
					),
					array(
						'property' => '--padding',
						'value'    => 'padding',
						'format'   => function( $value ) {
							return CSS_Utility::box_values( $value );
						},
					),
					array(
						'property' => '--brd-width',
						'value'    => 'borderWidth',
						'format'   => function( $value ) {
							return CSS_Utility::box_values( $value );
						},
					),
					array(
						'property' => '--brd-radius',
						'value'    => 'borderRadius',
						'format'   => function( $value ) {
							return CSS_Utility::box_values( $value );
						},
					),
					array(
						'property' => '--brd-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--brd-style',
						'value'    => 'borderStyle',
					),
					array(
						'property' => '--width',
						'value'    => 'width',
					),
					array(
						'property' => '--height',
						'value'    => 'height',
					),
				),
			)
		);

		// TODO: Add responsive values when #1259 is merged.
		$style = $css->generate();

		return $style;
	}
}
