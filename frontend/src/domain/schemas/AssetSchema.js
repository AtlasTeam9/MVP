import { z } from 'zod'

// Asset fields validation schema used in the form
const assetSchema = z.object({
    name: z.string().min(1, 'Name is required').max(30, 'Name is too long'),
    type: z.string().min(1, 'Type is required'),
    isSensitive: z.boolean({
        requiredError: 'Sensitive flag is required',
    }),
    desc: z.string().optional(),
})

export { assetSchema }
