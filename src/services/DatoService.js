export async function comunidadesDoUsuario (githubUser) {
    const query = {
        query: `{
            allComunidades (
                filter: {
                dono: {eq: ${githubUser}}
                }
            ) {
                id
                titulo
                urlImagem
            }
        }`
    };
    return _fetch(query);    
}

export async function recadosDoUsuario (githubUser) {
    const query = {
        query: `{
            allRecados(
                filter: {usuarioQueRecebeu: {eq: ${githubUser}}}
            ) {
                id
                mensagem(markdown: true)
                usuarioQueEnviou
                usuarioQueRecebeu
                urlFotoUsuarioQueEscreveu
            }
        }`
    };
    return _fetch(query);    
}

export async function RecadosDoUsuario (githubUser) {
    const query = {
        query: `{
            allComunidades (
                filter: {
                dono: {eq: ${githubUser}}
                }
            ) {
                id
                titulo
                urlImagem
            }
        }`
    };
    return _fetch(query);    
}

async function _fetch(query) {
    return fetch('https://graphql.datocms.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DATOCMS_READ_TOKEN}`,
        },
        body: JSON.stringify(query),
    });
}