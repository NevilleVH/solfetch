create table if not exists weather(
    id bigserial primary key,
    period_end timestamp with time zone,
    air_temp numeric(3),
    dni numeric(3),
    ghi numeric(3),
    relative_humidity  numeric(3),
    surface_pressure numeric(3),
    wind_speed_10m numeric(3),
    pv_power_rooftop numeric(3)
)


