export const fetchCoordinapeData = async (query: string) => {
    const url = 'https://coordinape-prod.hasura.app/v1/graphql'
    const Query = query

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': '82478|VpICtNupRgqJFwSjfDz3EJbrrTrEDoFNA8UHJMGK'

        },
        body: JSON.stringify({query: Query})
    }

    try {
        const response = await fetch(url, options)
        const data = await response.json()
        console.log(data)
        return data
    } catch (error) {
        console.error('Error fetching Coordinape data: ', error)
    }
}



// const query = `{
//     circles(where: {id: {_eq: "31099}}) {
//         id
//         name
//         epochs {
//             cirlce_id
//             id
//         }
//     }
// }`
// const data = fetchCoordinapeData(query)