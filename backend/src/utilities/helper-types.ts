export type OneOf<T extends readonly unknown[]> = T[number]

export type PluginCallback = FastifyPluginCallback<
    never,
    RawServerDefault,
    TypeBoxTypeProvider
>
