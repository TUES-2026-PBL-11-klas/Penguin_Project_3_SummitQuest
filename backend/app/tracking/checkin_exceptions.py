class CheckInServiceError(Exception):
    """Base exception for check-in service errors."""


class QuestNotFoundError(CheckInServiceError):
    """Raised when quest is not found."""


class QuestOwnerMismatchError(CheckInServiceError):
    """Raised when quest does not belong to the provided user."""


class InvalidQuestStatusError(CheckInServiceError):
    """Raised when quest cannot be completed because of its current status."""


class CheckInRepositoryError(CheckInServiceError):
    """Raised when the check-in repository fails."""