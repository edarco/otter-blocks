import { Dispatch, SetStateAction } from 'react';

export type BlockProps<T> = {
	attributes: Partial< T & { className: string }>
	setAttributes: ( attributes: Partial<T> ) => void
	isSelected: boolean
	clientId: string
	name: string
	toggleSelection: ( value: boolean ) => void
}

export interface InspectorProps<T> {
	attributes: Partial<T>
	setAttributes: ( attributes: Partial<T> ) => void
}

export type ImagePosition = {
	x: number,
	y: number
}

export type MediaImageProps = {
	id: number,
	url: string,
	alt: string
}

export type BoxType = {
	top?: string
	right?: string
	bottom?: string
	left?: string
}

export type MarginType = BoxType
export type PaddingType = BoxType
export type BorderType = BoxType

export type OtterNodeCSSOptions = {
	selector: string
}

export type OtterSetNodeCSS = ( css: string[], media: string[]) => void;

export type OtterNodeCSSReturn = [
	string,
	OtterSetNodeCSS,
	Dispatch<SetStateAction<{node: HTMLStyleElement | null, cssNodeName: string}>>
]

export interface OtterBlock<T> {
	attributes: T & { className: string, customCSS: string | null, hasCustomCSS: boolean}
	clientId: string
	innerBlocks: OtterBlock<T>[]
	isValid: boolean
	name: string
	originalContent: string
	validationIssues: unknown[]
}
