import MainPage from '../src/components/MainProfile'
import { handleServerSideProps } from '../src/lib/ServerSideProps'

export default function Home(props) {
    return <MainPage 
                githubUserInfo={props.loggedUserInfo}
                githubUser={props.loggedUser}
                loggedUser={props.loggedUser}
                loggedUserInfo={props.loggedUserInfo} />;
}

export async function getServerSideProps(context) {
    return handleServerSideProps(context);
}