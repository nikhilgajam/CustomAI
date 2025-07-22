import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{error.statusText || 'Error'}</h1>
      <p>Sorry, an error occurred.</p>
      <p>
        <strong>Message:</strong> <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}