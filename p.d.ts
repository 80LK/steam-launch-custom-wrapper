declare module "postject" {
	interface InjectOptions {
		machoSegmentName?: string;
		overwrite?: boolean;
		sentinelFuse?: string
	}
	export function inject(filename: string, resource_name: string, resource: Buffer, options?: InjectOptions): Promise<void>;
}
