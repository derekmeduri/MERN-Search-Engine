import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { getMe, deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { getSavedBookIds, removeBookId } from '../utils/localStorage';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
// create state to hold saved bookId values
const SavedBooks = () => {
  // Execute the GET_ME query on component load and save it to a variable named userData
  const token = Auth.loggedIn() ? Auth.getToken() : null;
  if (!token) {
    return false;
  }
  const { data, error, loading } = useQuery(GET_ME, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  console.log('data from SavedBooks page: ', data);
  const userData = data?.me || {};
  console.log('savedBooks data: ', userData.me?.savedBooks);
  // Use the useMutation() Hook to execute the REMOVE_BOOK mutation
  const [removeBook] = useMutation(REMOVE_BOOK);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  // Function to handle book deletion, replacing the old deleteBook function
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // Execute the removeBook mutation and pass in the bookId as a variable
      await removeBook({
        variables: { bookId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (loading) return <h2>LOADING...</h2>;
  if (error) return <h2>ERROR: {error.message}</h2>;

  return (
    <>
      <Container fluid className='text-light bg-dark p-5'>
        <h1>Viewing saved books!</h1>
      </Container>

      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md='4' key={book.bookId}>
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;