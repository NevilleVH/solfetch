import { Handler } from "aws-lambda";
import {z} from "zod"
import * as pg from "pg"

const url = `https://script.googleusercontent.com/a/macros/solink.co.za/echo?user_content_key=mMFKILKfN4pCpe_K-ymeLawywPBjs738P70RgRcUkk3iWf3cQJDgTcVTT-m8dvWBQzcntX2H1JIhcoxrCpglmQ1NLI4rTLy3OJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMi80zadyHLKCwq8y9dFH4mJT3zkIp4-K468n4RAo2RJxBnu0Hupo_TOS8jmg-86IFx3v2oWP-ldoU2gapZ-4-Ov1eLHQAMkT2dtcwQHkATq_P8HS5eahm695_B1e7ssetegtgkpBvh1_1BiB1RU8w4TrCMwGvcl2MsD64VxOIfL0&lib=MR_mt8Wmapn2W5zwbI-xTtMWO3py5UuMP`

let pool: pg.Pool | null = null

interface WeatherData {
    period_end: Date,
    air_temp: number,
    dni: number,
    ghi: number,
    relative_humidity: number,
    surface_pressure: number,
    wind_speed_10m: number,
    pv_power_rooftop: number
}

interface APIResponse {
    debugInfo: string,
    data: WeatherData[]
}

const responseSchema: z.ZodType<APIResponse> = z.object({
    debugInfo: z.string(),
    data: z.array(z.object({
        period_end: z.coerce.date(),
        air_temp: z.number(),
        dni: z.number(),
        ghi: z.number(),
        relative_humidity: z.number(),
        surface_pressure: z.number(),
        wind_speed_10m: z.number(),
        pv_power_rooftop: z.number()
    }))
})

export const  handler: Handler = async (event) => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error("Bad API response. Error code " + response.status)
    }

    const {data, success} = responseSchema.safeParse(await response.json())
    if (!success) {
        throw new Error("Invalid API response")
    }

    // Only create the pool once across lambda invocations
    if (!pool) {
        pool = new pg.Pool({
            max: 1,
            database: "solink",
            port: 5431,
            user: "user",
            password: "password"
        })
    }

    const client = await pool.connect()
    try {
        for (const row of data.data) {
            await insertRow(client, row)
        }
    } finally {
        client.release(true)
    }
}

function insertRow(client: pg.PoolClient, data: WeatherData) {
    const {air_temp, dni, ghi, period_end, pv_power_rooftop, relative_humidity, surface_pressure, wind_speed_10m} = data
    return client.query(`insert into weather (period_end, air_temp, dni, ghi, relative_humidity, surface_pressure, wind_speed_10m, pv_power_rooftop)
    values ($1, $2, $3, $4, $5, $6, $7, $8)`, 
        [period_end, air_temp, dni, ghi, relative_humidity, surface_pressure, wind_speed_10m, pv_power_rooftop])
}