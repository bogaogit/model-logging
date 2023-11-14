import { Dimension } from '@aws-sdk/client-cloudwatch/dist-types/models'

export function mapTagsToDimensions(tags: Record<string, string> | undefined): Dimension[] {
    if (!tags) return []
    const dimensions: Dimension[] = []

    Object.entries(tags).forEach(([key, value]) => {
        dimensions.push({
            Name: key,
            Value: value,
        })
    })

    return dimensions
}
