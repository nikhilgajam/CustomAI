import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div style={{ padding: '2rem', textAlign: 'center'}}>
      <h1>Error</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}
