export function MonthRange(year : number, from : number, count : number)
{
    return Array.from({ length : count}, (_,i) =>{
        const start = new Date(Date.UTC(year, from + i, 1));

        return {
            label : start.toLocaleDateString("en-AU", {month : "short", timeZone : "UTC"}),
            start,
            end: new Date(Date.UTC(year, from + i + 1, 1))
        }
    })
}