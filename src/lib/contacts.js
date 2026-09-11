// Single source of truth for contact channels.
// Consumed by ContactModal and Footer — update a handle here and both follow.

export const contacts = [
    {
        id: 'email',
        label: 'Email',
        detail: 'tanchenghong619@gmail.com',
        href: 'mailto:tanchenghong619@gmail.com',
        external: false,
    },
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        detail: '+60 12-785 7687',
        href: 'https://api.whatsapp.com/send?phone=60127857687&text=Hi%2C%20are%20you%20interested%20in%20a%20job%3F',
        external: true,
    },
    {
        id: 'linkedin',
        label: 'LinkedIn',
        detail: 'in/cheng-hong-tan',
        href: 'https://www.linkedin.com/in/cheng-hong-tan-a68a76388/',
        external: true,
    },
    {
        id: 'github',
        label: 'GitHub',
        detail: '@Chhhh619',
        href: 'https://github.com/Chhhh619',
        external: true,
    },
]
