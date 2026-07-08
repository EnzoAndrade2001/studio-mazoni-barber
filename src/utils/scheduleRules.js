const { HttpError } = require('./httpError');

function isoWeekdayFromDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new HttpError(400, 'A data deve estar no formato AAAA-MM-DD.');
    }
    const date = new Date(`${value}T12:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw new HttpError(400, 'Data invalida.');
    }
    const day = date.getUTCDay();
    return day === 0 ? 7 : day;
}

function minutesFromTime(value) {
    if (typeof value !== 'string' || !/^\d{2}:\d{2}/.test(value)) return null;
    const [hours, minutes] = value.slice(0, 5).split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
}

function localParts(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).formatToParts(date).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
}

function localDate(value) {
    const parts = localParts(value);
    if (!parts) return null;
    return `${parts.year}-${parts.month}-${parts.day}`;
}

function isWithinBusinessHours({ date, start, end, schedule }) {
    if (!schedule || !schedule.aberto) return false;
    const localStart = localParts(start);
    const localEnd = localParts(end);
    if (!localStart || !localEnd) return false;
    const startDay = `${localStart.year}-${localStart.month}-${localStart.day}`;
    const endDay = `${localEnd.year}-${localEnd.month}-${localEnd.day}`;
    if (startDay !== date || endDay !== date) return false;
    const startMinutes = Number(localStart.hour) * 60 + Number(localStart.minute);
    const endMinutes = Number(localEnd.hour) * 60 + Number(localEnd.minute);
    return startMinutes >= minutesFromTime(schedule.abertura)
        && endMinutes <= minutesFromTime(schedule.fechamento);
}

module.exports = {
    isoWeekdayFromDate,
    minutesFromTime,
    localDate,
    isWithinBusinessHours
};
