   // src/BookInputScreen.js
   import React, { useState } from 'react';
   import { View, TextInput, Button, StyleSheet } from 'react-native';

   const BookInputScreen = ({ onSubmit }) => {
     const [bookName, setBookName] = useState('');

     const handleSubmit = () => {
       if (bookName.trim()) {
         onSubmit(bookName);
         setBookName('');
       }
     };

     return (
       <View style={styles.container}>
         <TextInput
           style={styles.input}
           placeholder="Enter book name"
           value={bookName}
           onChangeText={setBookName}
         />
         <Button title="Submit" onPress={handleSubmit} />
       </View>
     );
   };

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       justifyContent: 'center',
       padding: 16,
     },
     input: {
       height: 40,
       borderColor: 'gray',
       borderWidth: 1,
       marginBottom: 12,
       paddingHorizontal: 8,
     },
   });

   export default BookInputScreen;