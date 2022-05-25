<?php
/**
 * Dynamic Content.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

/**
 * Class Dynamic_Content
 */
class Dynamic_Content {

	/**
	 * The main instance var.
	 *
	 * @var Dynamic_Content
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'the_content', array( $this, 'apply_dynamic_content' ) );
	}

	/**
	 * Filter post content.
	 *
	 * @param string $content Post content.
	 *
	 * @return string
	 */
	public function apply_dynamic_content( $content ) { 
		if ( false === strpos( $content, '<o-dynamic' ) ) {
			return $content;
		}

		$re = '/<o-dynamic(?:\s+(?:data-type=["\'](?P<type>[^"\'<>]+)["\']|data-id=["\'](?P<id>[^"\'<>]+)["\']|data-before=["\'](?P<before>[^"\'<>]+)["\']|data-after=["\'](?P<after>[^"\'<>]+)["\']|data-length=["\'](?P<length>[^"\'<>]+)["\']|data-date-type=["\'](?P<dateType>[^"\'<>]+)["\']|data-date-format=["\'](?P<dateFormat>[^"\'<>]+)["\']|data-date-custom=["\'](?P<dateCustom>[^"\'<>]+)["\']|data-time-type=["\'](?P<timeType>[^"\'<>]+)["\']|data-time-format=["\'](?P<timeFormat>[^"\'<>]+)["\']|data-time-custom=["\'](?P<timeCustom>[^"\'<>]+)["\']|data-term-type=["\'](?P<termType>[^"\'<>]+)["\']|data-term-separator=["\'](?P<termSeparator>[^"\'<>]+)["\']|data-meta-key=["\'](?P<metaKey>[^"\'<>]+)["\']|[a-zA-Z-]+=["\'][^"\'<>]+["\']))*\s*>(?<default>[^ $].*?)<\s*\/\s*o-dynamic>/';

		return preg_replace_callback( $re, array( $this, 'apply_data' ), $content );
	}

	/**
	 * Apply dynamic data.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string
	 */
	public function apply_data( $data ) {
		$value = $this->get_data( $data );

		if ( isset( $data['before'] ) || isset( $data['after'] ) ) {
			return $this->apply_formatting( $value, $data );
		}

		return $value;
	}

	/**
	 * Apply formatting.
	 *
	 * @param string $value Dynamic value.
	 * @param array  $data Dynamic request.
	 *
	 * @return string
	 */
	public function apply_formatting( $value, $data ) {
		if ( isset( $data['before'] ) ) {
			$value = esc_html( $data['before'] ) . $value;
		}

		if ( isset( $data['after'] ) ) {
			$value = $value . esc_html( $data['after'] );
		}

		return $value;
	}

	/**
	 * Get dynamic data.
	 *
	 * @param array $data Dynamic request.
	 *
	 * @return string
	 */
	public function get_data( $data ) {
		if ( ! isset( $data['type'] ) && isset( $data['default'] ) ) {
			return esc_html( $data['default'] );
		}

		if ( 'postID' === $data['type'] ) {
			return get_the_id();
		}

		if ( 'postTitle' === $data['type'] ) {
			return get_the_title();
		}

		if ( 'postExcerpt' === $data['type'] ) {
			return $this->get_excerpt( $data );
		}

		if ( 'postType' === $data['type'] ) {
			return get_post_type();
		}

		if ( 'postStatus' === $data['type'] ) {
			return get_post_status();
		}

		if ( 'siteTitle' === $data['type'] ) {
			return get_bloginfo( 'name' );
		}

		if ( 'siteTagline' === $data['type'] ) {
			return get_bloginfo( 'description' );
		}

		if ( 'authorName' === $data['type'] ) {
			return get_the_author_meta( 'display_name' );
		}

		if ( 'authorDescription' === $data['type'] ) {
			return get_the_author_meta( 'description' );
		}

		if ( 'loggedInUserName' === $data['type'] ) {
			return $this->get_loggedin_name( $data );
		}

		if ( 'loggedInUserDescription' === $data['type'] ) {
			return $this->get_loggedin_description( $data );
		}

		if ( 'loggedInUserEmail' === $data['type'] ) {
			return $this->get_loggedin_email( $data );
		}

		if ( 'archiveTitle' === $data['type'] ) {
			return get_the_archive_title();
		}

		if ( 'archiveDescription' === $data['type'] ) {
			return $this->get_archive_description( $data );
		}

		if ( 'date' === $data['type'] ) {
			return $this->get_current_date( $data );
		}

		if ( 'time' === $data['type'] ) {
			return $this->get_current_time( $data );
		}

		return apply_filters( 'otter_blocks_evaluate_dynamic_content', $data[0], $data );
	}

	/**
	 * Get Excerpt.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_excerpt( $data ) {
		$post    = get_post();
		$excerpt = $post->post_excerpt; // Here we don't use get_the_excerpt() function as it causes an infinite loop.

		if ( empty( $excerpt ) ) {
			return $data['default'];
		}

		if ( isset( $data['length'] ) && ! empty( $data['length'] ) ) {
			$excerpt = substr( $excerpt, 0, intval( $data['length'] ) ) . '…';
		}

		return sanitize_text_field( $excerpt );
	}

	/**
	 * Get Logged-in User Name.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_loggedin_name( $data ) {
		$user_id = get_current_user_id();
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$user    = get_userdata( $user_id );

		if ( false === $user ) {
			$display_name = $default;
		} else {
			$display_name = $user->display_name;
		}

		return esc_html( $display_name );
	}

	/**
	 * Get Logged-in User Description.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_loggedin_description( $data ) {
		$user_id = get_current_user_id();
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$user    = get_userdata( $user_id );

		if ( false === $user ) {
			$description = $default;
		} else {
			$description = $user->description;
		}

		return esc_html( $description );
	}

	/**
	 * Get Logged-in User Email.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_loggedin_email( $data ) {
		$user    = wp_get_current_user();
		$default = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
		$email   = $current_user->user_email;

		if ( empty( $email ) ) {
			$email = $default;
		}

		return esc_html( $email );
	}

	/**
	 * Get Archive Description.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_archive_description( $data ) {
		$description = get_the_archive_description();

		if ( empty( $description ) ) {
			$default     = isset( $data['default'] ) ? esc_html( $data['default'] ) : '';
			$description = $default;
		}

		return $description;
	}

	/**
	 * Get Current Date.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_current_date( $data ) {
		$format = get_option( 'date_format' );

		if ( isset( $data['dateFormat'] ) && ! empty( $data['dateFormat'] ) && 'default' !== $data['dateFormat'] && 'custom' !== $data['dateFormat'] ) {
			$format = esc_html( $data['dateFormat'] );
		}

		if ( isset( $data['dateCustom'] ) && ! empty( $data['dateCustom'] ) && isset( $data['dateFormat'] ) && 'custom' === $data['dateFormat'] ) {
			$format = esc_html( $data['dateCustom'] );
		}

		$date = date( $format );

		return $date;
	}

	/**
	 * Get Current Date.
	 *
	 * @param array $data Dynamic Data.
	 *
	 * @return string
	 */
	public function get_current_time( $data ) {
		$format = get_option( 'time_format' );

		if ( isset( $data['timeFormat'] ) && ! empty( $data['timeFormat'] ) && 'default' !== $data['timeFormat'] && 'custom' !== $data['timeFormat'] ) {
			$format = esc_html( $data['timeFormat'] );
		}

		if ( isset( $data['timeCustom'] ) && ! empty( $data['timeCustom'] ) && isset( $data['timeFormat'] ) && 'custom' === $data['timeFormat'] ) {
			$format = esc_html( $data['timeCustom'] );
		}

		$time = date( $format );

		return $time;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.2.0
	 * @access public
	 * @return Dynamic_Content
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 1.2.0
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @since 1.2.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
