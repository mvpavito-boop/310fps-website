import { ImageResponse } from "next/og";

export const alt = "310FPS Custom Lab — сборка игровых ПК на заказ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Карточка для мессенджеров и соцсетей. Собирается на лету из примитивов
   дизайн-системы: шрифты Unbounded здесь недоступны, поэтому вес и трекинг
   подобраны так, чтобы системный гротеск читался в той же тональности. */
export default async function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: "#070709",
                    padding: "72px 80px",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: -180,
                        bottom: -220,
                        width: 620,
                        height: 620,
                        borderRadius: "50%",
                        background: "radial-gradient(closest-side, rgba(206,144,72,0.42), transparent)",
                    }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: "#CE9048" }} />
                    <div
                        style={{
                            fontSize: 22,
                            letterSpacing: 8,
                            textTransform: "uppercase",
                            color: "#9B9BA4",
                        }}
                    >
                        310FPS Custom Lab · Санкт-Петербург
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            fontSize: 92,
                            fontWeight: 800,
                            lineHeight: 1.02,
                            letterSpacing: -2,
                            textTransform: "uppercase",
                            color: "#F2F1EC",
                        }}
                    >
                        Лаборатория,
                    </div>
                    <div
                        style={{
                            fontSize: 92,
                            fontWeight: 800,
                            lineHeight: 1.02,
                            letterSpacing: -2,
                            textTransform: "uppercase",
                            color: "#CE9048",
                        }}
                    >
                        а не конвейер
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                    {["Стресс-тест 24 часа", "Паспорт сборки", "Гарантия 12 месяцев"].map((item) => (
                        <div
                            key={item}
                            style={{
                                display: "flex",
                                fontSize: 24,
                                color: "#F2F1EC",
                                border: "1px solid rgba(255,255,255,0.14)",
                                borderRadius: 10,
                                padding: "14px 22px",
                            }}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        ),
        size
    );
}
