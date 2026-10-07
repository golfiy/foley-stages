# Foley – Stages (Hire / Onboard / Monitor) с hover-стейтами

HTML-прототип секции из Figma: [1595 – Start Stream, Page 8](https://www.figma.com/design/Dvi1gBhoXvurjb74BzXcKg/1595---Start-Stream?node-id=1140-9359) – `default_state` + 4 фрейма `hovers`.

```bash
python3 -m http.server 4958 --bind 127.0.0.1 --directory /Users/pc-38/Claude/foley-stages
```

Только локально, без remote (как остальные Foley-прототипы).

## Поведение

| Зона | Default | Hover / focus / tap |
|---|---|---|
| Hire, Onboard, Monitor | белый фон, text link «Start … →», product card | фон `#eeeef2`, subtitle сдвигается на 4px, 4 ссылки (20px) по stagger, белый CTA с 44px стрелкой. У Onboard бордеры `#c1cfe6` → `#d5d5d5` |
| Insights | sparkle (белый круг, градиентная звезда), text link «Get insights →» | sparkle → active-вариант (`#F1F6FD` + `#2E6274`) с поворотом на 90°, ряд ссылок + CTA «Get insights» |

- **Motion**: вход – default-контент уходит за 140ms, ссылки появляются со stagger 40ms (opacity 300ms + translateY 10px → 0, expo-out 520ms), CTA последним. Выход – быстрый (140ms, без stagger), default-контент возвращается с задержкой 90ms, чтобы слои не пересекались
- **Микро**: ссылка в hover-стейте – стрелка `→` уезжает на 4px, CTA – стрелка на 3px
- **Клавиатура**: Tab в колонку раскрывает её (`:focus-visible`), Tab наружу – закрывает, `Esc` закрывает. Ссылки и CTA всегда в DOM и читаются screen reader'ом; default text link и product card – `aria-hidden` (декор, на десктопе по ним невозможно кликнуть – курсор уже включил hover)
- **Тач**: первый тап раскрывает колонку, следующий тап по ссылке – переход, тап вне секции – закрыть
- **Responsive**: ≥1200 – как в макете (subtitle в одну строку); 960–1199 – subtitle переносится, product card масштабируется через `zoom` под ширину колонки; <960 – колонки стопкой, Insights сразу показывает ссылки и CTA (hover на тач-экране нет)
- **Reduced motion**: только crossfade, без сдвигов и поворота sparkle

## Режимы для ревью

| Параметр | Что делает |
|---|---|
| `.` (клавиша) | Demo panel: зафиксировать стейт (Auto / Hire / Onboard / Monitor / Insights), скорость ×1 / ×4 |
| `?panel` | Открыть demo panel сразу |
| `?shot=hire` | Статичный кадр стейта без анимаций (`default`, `hire`, `onboard`, `monitor`, `insights`) – для pixel-diff с Figma |
| `?slow=6` | Замедлить все переходы в N раз |

## Сверка с макетом

Headless Chrome 1356×897 vs `get_screenshot` из Figma по всем 5 фреймам: геометрия совпадает в пределах ~1px (CTA 165 / 210 / 205 / 171px vs 166 / 211 / 206 / 172 в Figma), разница – антиалиасинг текста.

## Файлы

- `index.html` – разметка; product cards (Hire / Onboard / Monitor) собраны 1:1 из компонентов `Product Card / *`
- `styles.css` – токены, state machine (`.is-active`), responsive, demo panel
- `app.js` – hover / focus / tap логика, `zoom` для product cards, режимы ревью
- `assets/` – SVG из Figma (стрелки, иконки, дороги карты, gauge, коннекторы, sparkle)

Шрифт: локальный **Inter Display** (как в макете), фолбэк – Google Fonts Inter с `opsz 32`.
