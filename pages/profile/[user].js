import { getUsuario } from '../../src/services/GitHubService'

import { useRouter } from 'next/router'
import MainPage from '../../src/components/MainProfile'
import { useEffect, useState } from 'react';
import { handleServerSideProps } from '../../src/lib/ServerSideProps';

export default function ProfilePage(props) {
    const [model, setModel] = useState({
        githubUserInfo: {}, 
        githubUser: ''
    });
    const router = useRouter();
    const { user } = router.query;

    useEffect(async () => {
        const respUser = await getUsuario(user);
        if (!respUser.ok) {
            throw Error();
        }
        const userInfo = await respUser.json();
        setModel({
            githubUserInfo: userInfo, 
            githubUser: user
        });
    }, [user]);
    
    return <MainPage 
                githubUserInfo={model.githubUserInfo} 
                githubUser={model.githubUser} 
                loggedUser={props.loggedUser} />;
}

export async function getServerSideProps(context) {
    return handleServerSideProps(context);
}