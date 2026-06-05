from app.reminders.schemas import ForecastSlot
from app.reminders.smart_reminder_service import SmartReminderService


def test_generates_best_weather_window():
    service = SmartReminderService()

    result = service.generate_reminder(
        [
            ForecastSlot(
                day="Saturday",
                temperature=18,
                sun_score=0.3,
            ),
            ForecastSlot(
                day="Sunday",
                temperature=24,
                sun_score=0.9,
            ),
        ]
    )

    assert "Sunday" in result["message"]