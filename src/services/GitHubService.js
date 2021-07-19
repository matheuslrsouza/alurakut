
export async function getSeguidores(githubUser) {
    const response = await fetch(`https://api.github.com/users/${githubUser}/followers`);
    if (!response.ok) {
        throw Error('falha ao buscar seguidores');
    }
    return response;
}

export async function getUsuario(githubUser) {
    return fetch(`https://api.github.com/users/${githubUser}`);
}

export async function isUsuarioValido(githubUser) {    
    const response = await getUsuario(githubUser);
    return response.ok;
}