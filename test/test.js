import { playButtonClickHandler, fetchPlayerScore } from '../js/main.js';

QUnit.module('Play Button Tests', function() {

    QUnit.test('Clicking the play button saves username to localStorage', function(assert) {
        // Arrange
        const username = "TestUser";
        document.getElementById("username").value = username;
        const playButton = document.querySelector(".play-button");

        // Mock localStorage
        localStorage.setItem = function(key, value) {
            assert.equal(key, 'user', 'LocalStorage key should be "user"');
            assert.equal(value, username, 'LocalStorage value should be the username');
        };

        // Act
        playButton.click();

        // Assert
        const savedNickname = localStorage.getItem('user');
        assert.equal(savedNickname, username, 'The nickname should be saved correctly');
    });

    QUnit.test('Clicking the play button saves playerId to localStorage', function(assert) {
        // Arrange
        const playButton = document.querySelector(".play-button");

        // Mock localStorage
        localStorage.setItem = function(key, value) {
            if (key === 'playerId') {
                assert.ok(value, 'Player ID should be saved');
            }
        };

        // Act
        playButton.click();
    });

    QUnit.test('Sanitize user input (escape HTML characters)', function(assert) {
        // Arrange
        const unsafeUsername = "<script>alert('XSS')</script>";
        document.getElementById("username").value = unsafeUsername;
        const playButton = document.querySelector(".play-button");

        // Mock localStorage
        localStorage.setItem = function(key, value) {
            if (key === 'user') {
                assert.equal(value, "&lt;script&gt;alert('XSS')&lt;/script&gt;", 'The username should be sanitized');
            }
        };

        // Act
        playButton.click();
    });

    QUnit.test('Test XMLHttpRequest PUT request on play button click', function(assert) {
        assert.expect(1);

        // Arrange
        const username = "TestUser";
        document.getElementById("username").value = username;
        const playButton = document.querySelector(".play-button");

        const fakeXHR = {
            open: function(method, url) {
                assert.equal(method, "PUT", 'Request method should be PUT');
                assert.equal(url, "https://j42aj6904i.execute-api.us-east-2.amazonaws.com/nicknames", 'Request URL should be correct');
            },
            setRequestHeader: function(header, value) {},
            send: function(data) {
                const parsedData = JSON.parse(data);
                assert.equal(parsedData.username, username, 'The data sent should contain the correct username');
            },
            status: 200,
            readyState: 4,
            onreadystatechange: function() {}
        };

        // Mock XMLHttpRequest
        window.XMLHttpRequest = function() {
            return fakeXHR;
        };

        // Act
        playButton.click();
    });

    QUnit.test('Display player score after page load', function(assert) {
        assert.expect(2);

        // Arrange
        const playerId = '12345';
        localStorage.setItem('playerId', playerId);

        const mockResponse = {
            score: 100
        };

        const finalScoreElement = document.createElement('span');
        finalScoreElement.classList.add('final-score');
        document.body.appendChild(finalScoreElement);

        // Mock XMLHttpRequest
        const fakeXHR = {
            open: function(method, url) {},
            setRequestHeader: function(header, value) {},
            send: function() {
                this.onreadystatechange();
            },
            status: 200,
            responseText: JSON.stringify(mockResponse),
            readyState: 4,
            onreadystatechange: function() {
                if (this.status === 200) {
                    let data = JSON.parse(this.responseText);
                    const finalScoreElement = document.querySelector('.final-score');
                    finalScoreElement.textContent = data.score;
                    assert.equal(finalScoreElement.textContent, 100, 'Score should be displayed correctly');
                }
            }
        };

        window.XMLHttpRequest = function() {
            return fakeXHR;
        };

        // Act
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

});
