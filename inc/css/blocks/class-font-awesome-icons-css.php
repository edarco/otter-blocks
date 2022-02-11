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
 * Class Font_Awesome_Icons_CSS
 */
class Font_Awesome_Icons_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'font-awesome-icons';

	/**
	 * Generate Font Awesome Icons CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--align',
						'value'    => 'align',
					),
					array(
						'property' => '--borderColor',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--borderSize',
						'value'    => 'borderSize',
						'unit'     => 'px',
					),
					array(
						'property' => '--borderRadius',
						'value'    => 'borderRadius',
						'unit'     => '%',
					),
					array(
						'property' => '--margin',
						'value'    => 'margin',
						'unit'     => 'px',
					),
					array(
						'property' => '--width',
						'unit'     => 'px',
						'default'  => 0,
						'format'   => function( $value, $attrs ) {
							$width = 0;

							if ( isset( $attrs['borderSize'] ) ) {
								$width += $this->get_attr_value( $attrs['borderSize'], 0 ) * 2;
							}

							if ( isset( $attrs['fontSize'] ) ) {
								$width += $this->get_attr_value( $attrs['fontSize'], 0 );
							} else {
								$width += 16;
							}

							if ( isset( $attrs['padding'] ) ) {
								$width += $this->get_attr_value( $attrs['padding'], 5 ) * 2;
							} else {
								$width += 5 * 2;
							}

							return $width;
						},
					),
					array(
						'property'  => '--padding',
						'value'     => 'padding',
						'unit'      => 'px',
					),
					array(
						'property' => '--fontSize',
						'value'    => 'fontSize',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'textColor',
					),
					array(
						'property' => 'background',
						'value'    => 'backgroundColor',
					),
					array(
						'property'  => 'padding',
						'value'     => 'padding',
						'default'   => 5,
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container:hover',
				'properties' => array(
					array(
						'property'  => 'color',
						'value'     => 'textColorHover',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' ) );
						},
					),
					array(
						'property' => 'background',
						'value'    => 'backgroundColorHover',
					),
					array(
						'property' => 'border-color',
						'value'    => 'borderColorHover',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container a',
				'properties' => array(
					array(
						'property'  => 'color',
						'value'     => 'textColor',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' ) );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container i',
				'properties' => array(
					array(
						'property' => 'font-size',
						'value'    => 'fontSize',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container svg',
				'properties' => array(
					array(
						'property'  => 'fill',
						'value'     => 'textColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container:hover svg',
				'properties' => array(
					array(
						'property'  => 'fill',
						'value'     => 'textColorHover',
						'condition' => function( $attrs ) {
							return isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' );
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
