from app.reminders.schemas import ForecastSlot


class SmartReminderService:
    def generate_reminder(
        self,
        forecast: list[ForecastSlot],
    ) -> dict:

        if not forecast:
            return {
                "title": "SummitQuest",
                "message": "Time for a new quest."
            }

        best_slot = max(
            forecast,
            key=lambda slot: slot.sun_score
        )

        return {
            "title": "SummitQuest",
            "message": (
                f"{best_slot.day} will be the best "
                f"weather window for your next quest."
            )
        }