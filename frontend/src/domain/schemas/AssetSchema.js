import { z } from 'zod'

// Asset fields validation schema used in the form
const assetSchema = z.object({
    //id: z.string().optional(), TODO: capire cosa fare con il campo id, se è necessario metterlo
    // nel form o se viene generato automaticamente
    name: z.string().min(1, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    isSensitive: z.boolean({
        requiredError: 'Sensitive flag is required',
    }),
    desc: z.string().optional(),
})

export { assetSchema }
