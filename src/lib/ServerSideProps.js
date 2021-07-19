import nookies from 'nookies';
import jwt from 'jsonwebtoken';
import { getUsuario } from '../services/GitHubService'

const UNAUTHORIZED = 401;

export async function handleServerSideProps(context) {
    const TOKEN = nookies.get(context).GITHUB_TOKEN;

    // verifica se o token é válido
    const resp = await fetch('https://alurakut.vercel.app/api/auth', {
        headers: {
            Authorization: TOKEN
        }
    });
    const { isAuthenticated } = await resp.json();

    try {
        if (!isAuthenticated) { 
            throw Error();
        }
        const githubUser = jwt.decode(TOKEN).githubUser;
        const respUser = await getUsuario(githubUser);
        if (!respUser.ok) {
            throw Error();
        }
        const userInfo = await respUser.json();
        console.log(userInfo);
        return {
            props: {
                githubUser: githubUser,
                githubUserInfo: userInfo, 
                loggedUser: githubUser
            }, // Will be passed to the page component as props
        }
    } catch (e) {
        resp.statusCode = UNAUTHORIZED;
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },        
        }
    }
}