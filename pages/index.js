import MainPage from '../src/components/MainProfile'
import { handleServerSideProps } from '../src/lib/ServerSideProps'

export default function Home(props) {    
    return <MainPage 
                githubUserInfo={props.githubUserInfo} 
                githubUser={props.githubUser}
                loggedUser={props.loggedUser} />;
}

export async function getServerSideProps(context) {
    return handleServerSideProps(context);
}